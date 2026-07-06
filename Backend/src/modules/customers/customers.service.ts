import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from '../../schemas/customer.schema';
import { Agent, AgentDocument } from '../../schemas/agent.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { PaginationQuery, PaginationResult } from '../../types/common.types';
import { TimezoneUtil } from '../../utils/timezone.util';
import { RedisCacheService } from '../cache/redis-cache.service';
import { CacheNamespace, CacheTTL, CACHE_INVALIDATION } from '../cache/cache-keys';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    private readonly cache: RedisCacheService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customerData = { ...createCustomerDto };

    // Nếu có agentId, lấy thông tin agent
    if (createCustomerDto.agentId) {
      const agent = await this.agentModel.findById(createCustomerDto.agentId);
      if (agent) {
        customerData.agentName = agent.name;
      }
    }

    const customer = new this.customerModel(customerData);
    const saved = await customer.save();
    await this.cache.invalidate(CACHE_INVALIDATION.customers);
    return saved;
  }

  async findAll(query: PaginationQuery = {}): Promise<PaginationResult<Customer>> {
    return this.cache.wrap(CacheNamespace.CUSTOMERS, { findAll: query }, CacheTTL.LIST, async () => {
    const { page = 1, limit = 20, search, agentId, light } = query;
    // Cho phép limit lớn hơn, tối đa 50000 records
    const safeLimit = Math.min(Math.max(limit, 1), 50000);
    const skip = (page - 1) * safeLimit;

    // Build match filter for search and agentId
    const matchFilter: any = {};

    // Filter by agentId if provided
    if (agentId) {
      // Convert string to ObjectId for proper comparison
      try {
        matchFilter.agentId = new Types.ObjectId(agentId);
      } catch (error) {
        // If agentId is not a valid ObjectId, no results will match
        matchFilter.agentId = null;
      }
    }

    // Search filter
    if (search) {
      matchFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { agentName: { $regex: search, $options: 'i' } },
      ];
    }

    // LIGHT: dropdown chọn khách chỉ cần _id/name/phone → BỎ HẲN lookup orders (đắt
    // nhất) và lookup agents. Chỉ find + phân trang trên index agentId. Nhanh ngay cả
    // khi cache miss, nên không còn cảnh chọn đại lý xong đợi lâu.
    if (light) {
      const [data, total] = await Promise.all([
        this.customerModel
          .find(matchFilter)
          .select('name phone email agentId agentName')
          .skip(skip)
          .limit(safeLimit)
          .lean()
          .exec(),
        this.customerModel.countDocuments(matchFilter),
      ]);
      return {
        data: data as any,
        total,
        page,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      };
    }

    // Đếm KHÔNG cần lookup — lookup chỉ thêm field, không đổi số bản ghi match.
    // (Filter search theo agentName dùng field agentName đã lưu sẵn trên customer,
    // nên đếm chỉ cần $match, không phụ thuộc lookup.)
    const countPipeline: any[] = [
      { $match: matchFilter },
      { $count: 'total' }
    ];

    // Dữ liệu: PHÂN TRANG TRƯỚC rồi mới $lookup, nên chỉ join đúng số khách của
    // trang hiện tại thay vì toàn bộ. Giữ nguyên thứ tự tự nhiên (không thêm
    // $sort) => kết quả trả về không đổi so với trước, chỉ nhanh hơn.
    const paginatedPipeline: any[] = [
      { $match: matchFilter },
      { $skip: skip },
      { $limit: safeLimit },
      {
        $addFields: {
          // Convert _id to string for comparison
          customerIdString: { $toString: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'orders',
          let: { customerId: '$_id', customerIdStr: '$customerIdString' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$customerId', '$$customerId'] },
                    { $eq: [{ $toString: '$customerId' }, '$$customerIdStr'] },
                    { $eq: ['$customerId', '$$customerIdStr'] }
                  ]
                }
              }
            }
          ],
          as: 'customerOrders'
        }
      },
      {
        $lookup: {
          from: 'agents',
          localField: 'agentId',
          foreignField: '_id',
          as: 'agent'
        }
      },
      {
        $addFields: {
          // Chỉ tính các đơn hàng active (không bị hủy)
          activeOrders: {
            $filter: {
              input: '$customerOrders',
              cond: { $ne: ['$$this.status', 'cancelled'] }
            }
          },
          // Thêm thông tin agent nếu có
          agentName: {
            $ifNull: [
              { $arrayElemAt: ['$agent.name', 0] },
              '$agentName'
            ]
          }
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$activeOrders' },
          totalAmount: {
            $sum: {
              $map: {
                input: '$activeOrders',
                as: 'order',
                in: '$$order.totalAmount'
              }
            }
          }
        }
      },
      {
        $project: {
          customerOrders: 0, // Loại bỏ array orders để giảm dung lượng
          activeOrders: 0,
          agent: 0,
          customerIdString: 0
        }
      }
    ];

    const [dataResult, countResult] = await Promise.all([
      this.customerModel.aggregate(paginatedPipeline).exec(),
      this.customerModel.aggregate(countPipeline).exec()
    ]);

    const total = countResult[0]?.total || 0;

    return {
      data: dataResult,
      total,
      page,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
    });
  }

  async findOne(id: string): Promise<Customer> {
    return this.cache.wrap(CacheNamespace.CUSTOMERS, { findOne: id }, CacheTTL.DETAIL, async () => {
      const customer = await this.customerModel
        .findById(id)
        .populate('agentId', 'name phone email')
        .exec();
      if (!customer) {
        throw new NotFoundException('Không tìm thấy khách hàng');
      }
      return customer;
    });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const updateData = { ...updateCustomerDto };

    // Nếu có agentId, lấy thông tin agent 
    if (updateCustomerDto.agentId) {
      const agent = await this.agentModel.findById(updateCustomerDto.agentId);
      if (agent) {
        updateData.agentName = agent.name;
      }
    } else if (updateCustomerDto.agentId === null || updateCustomerDto.agentId === '') {
      // Nếu xóa agent
      updateData.agentId = null;
      updateData.agentName = null;
    }

    const customer = await this.customerModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('agentId', 'name phone').exec();
    
    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }
    await this.cache.invalidate(CACHE_INVALIDATION.customers);
    return customer;
  }

  async remove(id: string): Promise<void> {
    const result = await this.customerModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }
    await this.cache.invalidate(CACHE_INVALIDATION.customers);
  }

  async search(keyword: string): Promise<Customer[]> {
    return this.cache.wrap(CacheNamespace.CUSTOMERS, { search: keyword }, CacheTTL.LIST, async () => {
      return this.customerModel.find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { phone: { $regex: keyword, $options: 'i' } },
          { email: { $regex: keyword, $options: 'i' } },
          { agentName: { $regex: keyword, $options: 'i' } },
        ]
      }).populate('agentId', 'name phone').exec();
    });
  }

  // Lấy khách hàng theo đại lý
  async getCustomersByAgent(agentId: string): Promise<Customer[]> {
    return this.cache.wrap(CacheNamespace.CUSTOMERS, { byAgent: agentId }, CacheTTL.LIST, async () => {
      // Convert string to ObjectId for proper comparison
      let agentObjectId;
      try {
        agentObjectId = new Types.ObjectId(agentId);
      } catch (error) {
        return []; // If agentId is not a valid ObjectId, return empty array
      }

      return this.customerModel
        .find({ agentId: agentObjectId })
        .populate('agentId', 'name phone')
        .exec();
    });
  }

  // Top khách hàng mua nhiều nhất
  async getTopCustomers(limit: number = 5): Promise<any[]> {
    return this.cache.wrap(CacheNamespace.CUSTOMERS, { topCustomers: limit }, CacheTTL.LIST, async () => {
    return this.customerModel.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'customerId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          // Chỉ tính các đơn hàng active (không bị hủy)
          activeOrders: {
            $filter: {
              input: '$orders',
              cond: { $ne: ['$$this.status', 'cancelled'] }
            }
          }
        }
      },
      {
        $addFields: {
          totalSpent: {
            $sum: {
              $map: {
                input: '$activeOrders',
                as: 'order',
                in: '$$order.totalAmount'
              }
            }
          },
          totalOrders: { $size: '$activeOrders' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      {
        $project: {
          name: 1,
          phone: 1,
          email: 1,
          agentName: 1,
          totalSpent: 1,
          totalOrders: 1
        }
      }
    ]);
    });
  }

  // Thống kê khách hàng
  async getCustomerStats(): Promise<any> {
    return this.cache.wrap(CacheNamespace.CUSTOMERS, { customerStats: true }, CacheTTL.STATISTICS, async () => {
    // Lấy tổng số khách hàng
    const totalCustomers = await this.customerModel.countDocuments();

    // Thống kê theo tháng hiện tại và tháng trước với múi giờ Việt Nam
    const now = TimezoneUtil.nowInVietnam();
    const vietnamDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

    // Tháng hiện tại
    const currentMonthStart = new Date(vietnamDate.getFullYear(), vietnamDate.getMonth(), 1);
    const currentMonthFilter = TimezoneUtil.createDateRangeFilter(
      currentMonthStart.toISOString(),
      now.toISOString()
    );

    // Tháng trước
    const previousMonthStart = new Date(vietnamDate.getFullYear(), vietnamDate.getMonth() - 1, 1);
    const previousMonthEnd = new Date(vietnamDate.getFullYear(), vietnamDate.getMonth(), 0);
    const previousMonthFilter = TimezoneUtil.createDateRangeFilter(
      previousMonthStart.toISOString(),
      previousMonthEnd.toISOString()
    );

    // Đếm khách hàng tháng hiện tại
    const currentMonthCustomers = await this.customerModel.countDocuments(currentMonthFilter);

    // Đếm khách hàng tháng trước
    const previousMonthCustomers = await this.customerModel.countDocuments(previousMonthFilter);

    // Tính % thay đổi
    const calculatePercentageChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 100) / 100;
    };

    const customersChange = calculatePercentageChange(currentMonthCustomers, previousMonthCustomers);

    return {
      totalCustomers,
      currentMonthCustomers,
      previousMonthCustomers,
      customersChange,
      customersChangeFormatted: `${customersChange >= 0 ? '+' : ''}${customersChange}%`
    };
    });
  }
}
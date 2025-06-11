import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../../schemas/customer.schema';
import { Agent, AgentDocument } from '../../schemas/agent.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { PaginationQuery, PaginationResult } from '../../types/common.types';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
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
    return customer.save();
  }

  async findAll(query: PaginationQuery = {}): Promise<PaginationResult<Customer>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    // Build match filter for search
    const matchFilter: any = {};
    if (search) {
      matchFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { agentName: { $regex: search, $options: 'i' } },
      ];
    }

    // Aggregation pipeline để tính tổng đơn hàng và giá trị
    const pipeline = [
      { $match: matchFilter },
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

    // Get paginated data
    const paginatedPipeline = [
      ...pipeline,
      { $skip: skip },
      { $limit: limit }
    ];

    // Get total count
    const countPipeline = [
      ...pipeline,
      { $count: 'total' }
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
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerModel
      .findById(id)
      .populate('agentId', 'name phone email')
      .exec();
    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }
    return customer;
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
    return customer;
  }

  async remove(id: string): Promise<void> {
    const result = await this.customerModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }
  }

  async search(keyword: string): Promise<Customer[]> {
    return this.customerModel.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { agentName: { $regex: keyword, $options: 'i' } },
      ]
    }).populate('agentId', 'name phone').exec();
  }

  // Lấy khách hàng theo đại lý
  async getCustomersByAgent(agentId: string): Promise<Customer[]> {
    return this.customerModel
      .find({ agentId })
      .populate('agentId', 'name phone')
      .exec();
  }

  // Top khách hàng mua nhiều nhất
  async getTopCustomers(limit: number = 5): Promise<any[]> {
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
  }

  // Thống kê khách hàng với % thay đổi
  async getCustomerStats(): Promise<any> {
    const now = new Date();
    
    // Tháng hiện tại
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = now;
    
    // Tháng trước
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Đếm khách hàng tháng hiện tại
    const currentMonthCustomers = await this.customerModel.countDocuments({
      createdAt: {
        $gte: currentMonthStart,
        $lte: currentMonthEnd
      }
    });

    // Đếm khách hàng tháng trước
    const previousMonthCustomers = await this.customerModel.countDocuments({
      createdAt: {
        $gte: previousMonthStart,
        $lte: previousMonthEnd
      }
    });

    // Tổng khách hàng
    const totalCustomers = await this.customerModel.countDocuments();

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
  }
}
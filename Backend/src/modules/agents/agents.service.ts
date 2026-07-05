import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../../schemas/agent.schema';
import { CreateAgentDto, UpdateAgentDto } from './dto/agent.dto';
import { PaginationQuery, PaginationResult } from '../../types/common.types';
import { RedisCacheService } from '../cache/redis-cache.service';
import { CacheNamespace, CacheTTL, CACHE_INVALIDATION } from '../cache/cache-keys';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    private readonly cache: RedisCacheService,
  ) {}

  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    const agent = new this.agentModel(createAgentDto);
    const saved = await agent.save();
    await this.cache.invalidate(CACHE_INVALIDATION.agents);
    return saved;
  }

  async findAll(query: PaginationQuery = {}): Promise<PaginationResult<Agent>> {
    // Parse số một cách rõ ràng để tránh lỗi aggregation
    const page = parseInt(String(query.page || 1), 10);
    const limit = parseInt(String(query.limit || 10), 10);
    // Cho phép limit lớn hơn, tối đa 50000 records
    const safeLimit = Math.min(Math.max(limit, 1), 50000);
    const search = query.search;

    return this.cache.wrap(CacheNamespace.AGENTS, { findAll: query }, CacheTTL.LIST, async () => {
    const skip = (page - 1) * safeLimit;

    // Build match filter
    const matchFilter: any = {};
    if (search) {
      matchFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Đếm KHÔNG cần lookup — lookup chỉ thêm field, không đổi số bản ghi match.
    // Tách riêng để việc đếm chỉ chạm index của $match, nhẹ hơn nhiều.
    const countPipeline: any[] = [
      { $match: matchFilter },
      { $count: 'total' }
    ];

    // Dữ liệu: PHÂN TRANG TRƯỚC rồi mới $lookup, nên chỉ join đúng số đại lý của
    // trang hiện tại (vd 10) thay vì toàn bộ. Giữ nguyên thứ tự tự nhiên (không
    // thêm $sort) => kết quả trả về không đổi so với trước, chỉ nhanh hơn.
    const paginatedPipeline: any[] = [
      { $match: matchFilter },
      { $skip: skip },
      { $limit: safeLimit },
      {
        $addFields: {
          // Convert _id to string for comparison
          agentIdString: { $toString: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'orders',
          let: { agentId: '$_id', agentIdStr: '$agentIdString' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$agentId', '$$agentId'] },
                    { $eq: [{ $toString: '$agentId' }, '$$agentIdStr'] },
                    { $eq: ['$agentId', '$$agentIdStr'] }
                  ]
                }
              }
            }
          ],
          as: 'agentOrders'
        }
      },
      {
        $addFields: {
          // Chỉ tính các đơn hàng active (không bị hủy)
          activeOrders: {
            $filter: {
              input: '$agentOrders',
              cond: { $ne: ['$$this.status', 'cancelled'] }
            }
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
          agentOrders: 0, // Loại bỏ array orders để giảm dung lượng
          activeOrders: 0,
          agentIdString: 0
        }
      }
    ];

    const [dataResult, countResult] = await Promise.all([
      this.agentModel.aggregate(paginatedPipeline).exec(),
      this.agentModel.aggregate(countPipeline).exec()
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

  async findOne(id: string): Promise<Agent> {
    return this.cache.wrap(CacheNamespace.AGENTS, { findOne: id }, CacheTTL.DETAIL, async () => {
      const agent = await this.agentModel.findById(id).exec();
      if (!agent) {
        throw new NotFoundException('Không tìm thấy đại lý');
      }
      return agent;
    });
  }

  async update(id: string, updateAgentDto: UpdateAgentDto): Promise<Agent> {
    const agent = await this.agentModel.findByIdAndUpdate(
      id,
      updateAgentDto,
      { new: true }
    ).exec();

    if (!agent) {
      throw new NotFoundException('Không tìm thấy đại lý');
    }
    await this.cache.invalidate(CACHE_INVALIDATION.agents);
    return agent;
  }

  async remove(id: string): Promise<void> {
    const result = await this.agentModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Không tìm thấy đại lý');
    }
    await this.cache.invalidate(CACHE_INVALIDATION.agents);
  }

  async search(keyword: string): Promise<Agent[]> {
    return this.cache.wrap(CacheNamespace.AGENTS, { search: keyword }, CacheTTL.LIST, async () => {
      return this.agentModel.find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { phone: { $regex: keyword, $options: 'i' } },
          { email: { $regex: keyword, $options: 'i' } },
        ]
      }).exec();
    });
  }

  // Lấy đại lý có doanh số cao nhất
  async getTopAgents(limit: number = 5): Promise<any[]> {
    // Đảm bảo limit là số
    const limitNum = parseInt(String(limit), 10);

    return this.cache.wrap(CacheNamespace.AGENTS, { topAgents: limitNum }, CacheTTL.LIST, async () => {
    return this.agentModel.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'agentId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalSales: {
            $sum: {
              $map: {
                input: { 
                  $filter: { 
                    input: '$orders', 
                    cond: { $ne: ['$$this.status', 'cancelled'] } 
                  } 
                },
                as: 'order',
                in: '$$order.totalAmount'
              }
            }
          },
          totalOrders: {
            $size: { 
              $filter: { 
                input: '$orders', 
                cond: { $ne: ['$$this.status', 'cancelled'] } 
              } 
            }
          }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: limitNum },
      {
        $project: {
          name: 1,
          phone: 1,
          email: 1,
          totalSales: 1,
          totalOrders: 1
        }
      }
    ]);
    });
  }
}
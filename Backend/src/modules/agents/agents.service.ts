import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../../schemas/agent.schema';
import { CreateAgentDto, UpdateAgentDto } from './dto/agent.dto';
import { PaginationQuery, PaginationResult } from '../../types/common.types';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
  ) {}

  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    const agent = new this.agentModel(createAgentDto);
    return agent.save();
  }

  async findAll(query: PaginationQuery = {}): Promise<PaginationResult<Agent>> {
    // Parse số một cách rõ ràng để tránh lỗi aggregation
    const page = parseInt(String(query.page || 1), 10);
    const limit = parseInt(String(query.limit || 10), 10);
    const search = query.search;
    
    const skip = (page - 1) * limit;

    // Build match filter
    const matchFilter: any = {};
    if (search) {
      matchFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Aggregation pipeline với lookup orders
    const pipeline: any[] = [
      { $match: matchFilter },
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
      this.agentModel.aggregate(paginatedPipeline).exec(),
      this.agentModel.aggregate(countPipeline).exec()
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

  async findOne(id: string): Promise<Agent> {
    const agent = await this.agentModel.findById(id).exec();
    if (!agent) {
      throw new NotFoundException('Không tìm thấy đại lý');
    }
    return agent;
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
    return agent;
  }

  async remove(id: string): Promise<void> {
    const result = await this.agentModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Không tìm thấy đại lý');
    }
  }

  async search(keyword: string): Promise<Agent[]> {
    return this.agentModel.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ]
    }).exec();
  }

  // Lấy đại lý có doanh số cao nhất
  async getTopAgents(limit: number = 5): Promise<any[]> {
    // Đảm bảo limit là số
    const limitNum = parseInt(String(limit), 10);
    
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
  }
} 
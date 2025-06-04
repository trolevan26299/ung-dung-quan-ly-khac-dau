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
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const filter: any = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.agentModel.find(filter).skip(skip).limit(limit).exec(),
      this.agentModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Agent> {
    const agent = await this.agentModel.findById(id).exec();
    if (!agent || !agent.isActive) {
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
      isActive: true,
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ]
    }).exec();
  }

  // Lấy đại lý có doanh số cao nhất
  async getTopAgents(limit: number = 5): Promise<any[]> {
    return this.agentModel.aggregate([
      { $match: { isActive: true } },
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
                input: { $filter: { input: '$orders', cond: { $eq: ['$$this.status', 'active'] } } },
                as: 'order',
                in: '$$order.totalAmount'
              }
            }
          },
          totalOrders: {
            $size: { $filter: { input: '$orders', cond: { $eq: ['$$this.status', 'active'] } } }
          }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: limit },
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
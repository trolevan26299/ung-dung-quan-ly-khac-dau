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

    const filter: any = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { agentName: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .populate('agentId', 'name phone')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.customerModel.countDocuments(filter),
    ]);

    return {
      data,
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
    if (!customer || !customer.isActive) {
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
      isActive: true,
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
      .find({ agentId, isActive: true })
      .populate('agentId', 'name phone')
      .exec();
  }

  // Top khách hàng mua nhiều nhất
  async getTopCustomers(limit: number = 5): Promise<any[]> {
    return this.customerModel.aggregate([
      { $match: { isActive: true } },
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
          totalSpent: {
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
} 
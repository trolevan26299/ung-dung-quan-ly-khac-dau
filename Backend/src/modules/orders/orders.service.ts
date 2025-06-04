import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Customer, CustomerDocument } from '../../schemas/customer.schema';
import { Agent, AgentDocument } from '../../schemas/agent.schema';
import { CreateOrderDto, UpdateOrderDto, OrderQueryDto } from './dto/order.dto';
import { PaginationResult, OrderStatus, PaymentStatus } from '../../types/common.types';
import { StockService } from '../stock/stock.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    private stockService: StockService,
  ) {}

  async create(createOrderDto: CreateOrderDto, employeeId: string, employeeName: string): Promise<Order> {
    // Kiểm tra sản phẩm và số lượng tồn kho
    for (const item of createOrderDto.items) {
      const product = await this.productModel.findById(item.productId);
      if (!product || !product.isActive) {
        throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${item.productId}`);
      }
      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Không đủ hàng trong kho cho sản phẩm ${product.name}. Tồn kho: ${product.stockQuantity}, yêu cầu: ${item.quantity}`
        );
      }
    }

    // Tạo mã đơn hàng tự động
    const orderCount = await this.orderModel.countDocuments();
    const orderCode = `DH${String(orderCount + 1).padStart(6, '0')}`;

    // Tính toán tổng tiền
    const subtotal = createOrderDto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vat = createOrderDto.vat || 0;
    const shippingFee = createOrderDto.shippingFee || 0;
    const totalAmount = subtotal + vat + shippingFee;

    // Lấy thông tin khách hàng/đại lý
    let customerName = createOrderDto.customerName;
    let customerPhone = createOrderDto.customerPhone;
    let agentName = createOrderDto.agentName;

    if (createOrderDto.customerId) {
      const customer = await this.customerModel.findById(createOrderDto.customerId);
      if (customer) {
        customerName = customer.name;
        customerPhone = customer.phone;
      }
    }

    if (createOrderDto.agentId) {
      const agent = await this.agentModel.findById(createOrderDto.agentId);
      if (agent) {
        agentName = agent.name;
      }
    }

    // Tạo đơn hàng
    const order = new this.orderModel({
      ...createOrderDto,
      orderCode,
      employeeId,
      employeeName,
      subtotal,
      totalAmount,
      customerName,
      customerPhone,
      agentName,
      status: OrderStatus.ACTIVE,
    });

    const savedOrder = await order.save();

    // Trừ kho cho từng sản phẩm
    for (const item of createOrderDto.items) {
      await this.stockService.exportStock(
        item.productId,
        item.quantity,
        savedOrder._id.toString(),
        employeeId,
        employeeName
      );
    }

    return savedOrder;
  }

  async findAll(query: OrderQueryDto = {}): Promise<PaginationResult<Order>> {
    const { page = 1, limit = 10, search, paymentStatus, status, customerId, agentId } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { orderCode: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { agentName: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (status) {
      filter.status = status;
    }

    if (customerId) {
      filter.customerId = customerId;
    }

    if (agentId) {
      filter.agentId = agentId;
    }

    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name phone')
        .populate('agentId', 'name phone')
        .populate('employeeId', 'username fullName')
        .exec(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('customerId', 'name phone address email')
      .populate('agentId', 'name phone address email')
      .populate('employeeId', 'username fullName')
      .populate('items.productId', 'code name currentPrice')
      .exec();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      updateOrderDto,
      { new: true }
    ).exec();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return order;
  }

  async cancel(id: string, employeeId: string, employeeName: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Đơn hàng đã được hủy trước đó');
    }

    // Hoàn trả kho
    for (const item of order.items) {
      await this.stockService.returnStock(
        item.productId.toString(),
        item.quantity,
        id,
        employeeId,
        employeeName
      );
    }

    // Cập nhật trạng thái đơn hàng
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      id,
      { status: OrderStatus.CANCELLED },
      { new: true }
    ).exec();

    return updatedOrder;
  }

  // Thống kê đơn hàng
  async getOrderStats(startDate?: Date, endDate?: Date): Promise<any> {
    const filter: any = { status: OrderStatus.ACTIVE };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const stats = await this.orderModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalDebt: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'debt'] }, '$totalAmount', 0]
            }
          },
          completedRevenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'completed'] }, '$totalAmount', 0]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalDebt: 0,
      completedRevenue: 0
    };

    // Tính lợi nhuận ước tính (doanh thu - chi phí ước tính)
    // Giả sử lợi nhuận = 30% doanh thu
    result.estimatedProfit = result.completedRevenue * 0.3;

    return result;
  }

  // Lấy đơn hàng theo khách hàng
  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.orderModel
      .find({ customerId, status: OrderStatus.ACTIVE })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'code name')
      .exec();
  }

  // Lấy đơn hàng theo đại lý
  async getOrdersByAgent(agentId: string): Promise<Order[]> {
    return this.orderModel
      .find({ agentId, status: OrderStatus.ACTIVE })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'code name')
      .exec();
  }

  // Đơn hàng chưa thanh toán
  async getPendingPaymentOrders(): Promise<Order[]> {
    return this.orderModel
      .find({ 
        status: OrderStatus.ACTIVE,
        paymentStatus: { $in: [PaymentStatus.PENDING, PaymentStatus.DEBT] }
      })
      .sort({ createdAt: -1 })
      .populate('customerId', 'name phone')
      .populate('agentId', 'name phone')
      .exec();
  }

  // Cập nhật trạng thái thanh toán
  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    ).exec();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return order;
  }

  // Doanh thu theo tháng
  async getMonthlyRevenue(year: number): Promise<any[]> {
    return this.orderModel.aggregate([
      {
        $match: {
          status: OrderStatus.ACTIVE,
          paymentStatus: PaymentStatus.COMPLETED,
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
  }
}
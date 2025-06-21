import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Customer, CustomerDocument } from '../../schemas/customer.schema';
import { Agent, AgentDocument } from '../../schemas/agent.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateOrderDto, UpdateOrderDto, OrderQueryDto } from './dto/order.dto';
import { PaginationResult, OrderStatus, PaymentStatus } from '../../types/common.types';
import { StockService } from '../stock/stock.service';
import { TimezoneUtil } from '../../utils/timezone.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private stockService: StockService,
  ) {}

  // Helper method để lấy system user ID
  private async getSystemUserId(): Promise<string> {
    let systemUser = await this.userModel.findOne({ username: 'system' });
    
    if (!systemUser) {
      // Tạo system user nếu chưa có
      systemUser = await this.userModel.create({
        username: 'system',
        fullName: 'System User',
        password: 'system', // Password không quan trọng vì system user không login
        role: 'admin',
        isActive: true
      });
    }
    
    return systemUser._id.toString();
  }

  async create(createOrderDto: CreateOrderDto, employeeId: string, employeeName: string): Promise<Order> {
    // Xử lý customer
    let customerId = createOrderDto.customerId;
    
    if (!customerId && createOrderDto.customerName?.trim()) {
      // Tạo customer mới từ thông tin nhập vào
      const newCustomerData: any = {
        name: createOrderDto.customerName.trim(),
        address: '', // Để trống, có thể cập nhật sau
        agentId: createOrderDto.agentId || null,
        agentName: createOrderDto.agentName || ''
      };

      // Chỉ thêm phone nếu có giá trị
      if (createOrderDto.customerPhone?.trim()) {
        newCustomerData.phone = createOrderDto.customerPhone.trim();
      }

      // Nếu có agentId, lấy tên agent
      if (createOrderDto.agentId) {
        const agent = await this.agentModel.findById(createOrderDto.agentId);
        if (agent) {
          newCustomerData.agentId = agent._id;
          newCustomerData.agentName = agent.name;
        }
      } else {
        // Tìm hoặc tạo agent mặc định
        let defaultAgent = await this.agentModel.findOne({ name: 'Bán lẻ' });
        if (!defaultAgent) {
          defaultAgent = await this.agentModel.create({
            name: 'Bán lẻ',
            phone: '0000000000',
            address: 'Cửa hàng',
            notes: 'Agent mặc định cho bán lẻ'
          });
        }
        newCustomerData.agentId = defaultAgent._id;
        newCustomerData.agentName = defaultAgent.name;
      }

      const newCustomer = await this.customerModel.create(newCustomerData);
      customerId = newCustomer._id.toString();
    } else if (!customerId) {
      // Nếu không có customerId và không có customerName, tạo customer mặc định cho bán lẻ
      let defaultCustomer = await this.customerModel.findOne({ name: 'Khách lẻ' });
      
      if (!defaultCustomer) {
        // Tìm hoặc tạo agent mặc định
        let defaultAgent = await this.agentModel.findOne({ name: 'Bán lẻ' });
        if (!defaultAgent) {
          defaultAgent = await this.agentModel.create({
            name: 'Bán lẻ',
            phone: '0000000000',
            address: 'Cửa hàng',
            notes: 'Agent mặc định cho bán lẻ'
          });
        }

        // Tạo customer mặc định
        defaultCustomer = await this.customerModel.create({
          name: 'Khách lẻ',
          phone: '0000000000',
          address: 'Bán lẻ tại cửa hàng',
          agentId: defaultAgent._id,
          agentName: defaultAgent.name
        });
      }
      
      customerId = defaultCustomer._id.toString();
    }

    // Kiểm tra sản phẩm và số lượng tồn kho
    const orderItems = [];
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
      
      // Tạo orderItem với productName và totalPrice
      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      });
    }

    // Tạo mã đơn hàng tự động
    const orderCount = await this.orderModel.countDocuments();
    const orderNumber = `DH${String(orderCount + 1).padStart(6, '0')}`;

    // Tính toán tổng tiền
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const vatRate = createOrderDto.vat || 0;
    const vatAmount = subtotal * (vatRate / 100);
    const shippingFee = createOrderDto.shippingFee || 0;
    const totalAmount = subtotal + vatAmount + shippingFee;

    // Lấy thông tin khách hàng/đại lý
    let customerName = createOrderDto.customerName;
    let customerPhone = createOrderDto.customerPhone;
    let agentName = createOrderDto.agentName;

    if (customerId) {
      const customer = await this.customerModel.findById(customerId);
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
      orderNumber,
      customerId: customerId,
      agentId: createOrderDto.agentId,
      items: orderItems,
      subtotal,
      vatRate,
      vatAmount,
      shippingFee,
      totalAmount,
      paymentStatus: createOrderDto.paymentStatus,
      paymentMethod: createOrderDto.paymentMethod || 'personal_account',
      notes: createOrderDto.notes,
      createdBy: employeeId,
      status: OrderStatus.ACTIVE,
    });

    const savedOrder = await order.save();

    // Trừ kho cho từng sản phẩm
    for (const item of orderItems) {
      await this.stockService.exportStock(
        item.productId,
        item.quantity,
        savedOrder._id.toString(),
        employeeId,
        employeeName,
        item.unitPrice
      );
    }

    // Populate dữ liệu trước khi trả về
    const populatedOrder = await this.orderModel
      .findById(savedOrder._id)
      .populate('customerId', 'name phone address email')
      .populate('agentId', 'name phone address email')
      .populate('createdBy', 'username fullName')
      .exec();

    // Transform để frontend có thể access đúng field names
    const transformedOrder = populatedOrder.toObject() as any;
    transformedOrder.customer = transformedOrder.customerId;
    transformedOrder.agent = transformedOrder.agentId;
    
    // Transform items để frontend có thể access product info
    if (transformedOrder.items) {
      transformedOrder.items = transformedOrder.items.map(item => ({
        ...item,
        product: item.productId // Map productId to product for frontend compatibility
      }));
    }
    
    return transformedOrder;
  }

  async findAll(query: OrderQueryDto = {}): Promise<PaginationResult<Order>> {
    const { page = 1, limit = 10, search, paymentStatus, status, customerId, agentId, dateFrom, dateTo } = query;
    const skip = (Number(page) - 1) * Number(limit);

    let filter: any = {};

    // Basic filters
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

    // Date filter
    if (dateFrom || dateTo) {
      const dateFilter = TimezoneUtil.createDateRangeFilter(dateFrom, dateTo);
      filter = { ...filter, ...dateFilter };
    }

    // Search logic
    if (search) {
      // First get customers and agents that match search term
      const [matchingCustomers, matchingAgents] = await Promise.all([
        this.customerModel.find({ 
          name: { $regex: search, $options: 'i' } 
        }).select('_id name'),
        this.agentModel.find({ 
          name: { $regex: search, $options: 'i' } 
        }).select('_id name')
      ]);

      const customerIds = matchingCustomers.map(c => c._id.toString());
      const agentIds = matchingAgents.map(a => a._id.toString());

      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        ...(customerIds.length > 0 ? [{ customerId: { $in: customerIds } }] : []),
        ...(agentIds.length > 0 ? [{ agentId: { $in: agentIds } }] : [])
      ];
    }

    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .populate('customerId', 'name phone address email')
        .populate('agentId', 'name phone address email')
        .populate('createdBy', 'username fullName')
        .exec(),
      this.orderModel.countDocuments(filter),
    ]);

    // Transform data để frontend có thể access đúng field names
    const transformedData = data.map(order => {
      const transformed = order.toObject() as any;
      transformed.customer = transformed.customerId;
      transformed.agent = transformed.agentId;
      return transformed;
    });

    return {
      data: transformedData,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('customerId', 'name phone address email')
      .populate('agentId', 'name phone address email')
      .populate('createdBy', 'username fullName')
      .populate('items.productId', 'code name currentPrice')
      .exec();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    // Transform để frontend có thể access đúng field names
    const transformedOrder = order.toObject() as any;
    transformedOrder.customer = transformedOrder.customerId;
    transformedOrder.agent = transformedOrder.agentId;
    
    // Transform items để frontend có thể access product info
    if (transformedOrder.items) {
      transformedOrder.items = transformedOrder.items.map(item => ({
        ...item,
        product: item.productId // Map productId to product for frontend compatibility
      }));
    }
    
    return transformedOrder;
  }

  // Method riêng để lấy order mà không populate productId (để xử lý stock)
  async findOneForStockOperation(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    console.log('🔍 Update Order - Received data:', updateOrderDto);
    
    // Get current order first
    const currentOrder = await this.orderModel.findById(id).exec();
    if (!currentOrder) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    // Kiểm tra nếu đơn hàng đã hủy
    if (currentOrder.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Không thể cập nhật đơn hàng đã hủy');
    }

    console.log('📋 Current order items before update:', currentOrder.items);

    // Update order with new data
    const updatedFields: any = { ...updateOrderDto };

    console.log('📤 Fields to update:', updatedFields);

    // Handle items update if provided
    if (updateOrderDto.items && updateOrderDto.items.length > 0) {
      console.log('🔄 Updating items...');
      
      // Get current items for stock comparison
      const currentItems = currentOrder.items || [];
      const newItems = updateOrderDto.items;
      
      console.log('📊 Current items for stock comparison:', currentItems);
      console.log('📊 New items for stock comparison:', newItems);

      // Create map of current items by productId for easy lookup
      const currentItemsMap = new Map();
      currentItems.forEach(item => {
        const productId = item.productId.toString();
        currentItemsMap.set(productId, item.quantity);
      });

      // Create map of new items by productId
      const newItemsMap = new Map();
      newItems.forEach(item => {
        newItemsMap.set(item.productId, item.quantity);
      });

      console.log('🗺️ Current items map:', Array.from(currentItemsMap.entries()));
      console.log('🗺️ New items map:', Array.from(newItemsMap.entries()));

      // Process stock changes
      // 1. Handle removed or reduced items (return stock)
      for (const [productId, currentQty] of currentItemsMap) {
        const newQty = newItemsMap.get(productId) || 0;
        if (newQty < currentQty) {
          const returnQty = currentQty - newQty;
          console.log(`📦 Returning stock for product ${productId}: ${returnQty} units`);
          
          const systemUserId = await this.getSystemUserId();
          await this.stockService.returnStock(
            productId,
            returnQty,
            id,
            systemUserId,
            'System Order Update'
          );
        }
      }

      // 2. Handle new or increased items (export stock)
      for (const [productId, newQty] of newItemsMap) {
        const currentQty = currentItemsMap.get(productId) || 0;
        if (newQty > currentQty) {
          const exportQty = newQty - currentQty;
          console.log(`📤 Exporting stock for product ${productId}: ${exportQty} units`);
          
          // Lấy unitPrice từ item tương ứng
          const itemData = updateOrderDto.items.find(item => item.productId === productId);
          const unitPrice = itemData?.unitPrice || 0;
          
          const systemUserId = await this.getSystemUserId();
          await this.stockService.exportStock(
            productId,
            exportQty,
            id,
            systemUserId,
            'System Order Update',
            unitPrice // Truyền unitPrice từ order item
          );
        }
      }
      
      // Validate products and create order items
      const orderItems = [];
      for (const item of updateOrderDto.items) {
        const product = await this.productModel.findById(item.productId);
        if (!product || !product.isActive) {
          throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${item.productId}`);
        }
        
        // Create orderItem with productName and totalPrice
        orderItems.push({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice
        });
      }
      
      updatedFields.items = orderItems;
      console.log('✅ Updated items:', orderItems);
    }

    // Recalculate totalAmount if VAT, shipping fee, or items changed
    if (updateOrderDto.items || updateOrderDto.vat !== undefined || updateOrderDto.shippingFee !== undefined) {
      // Use new items if provided, otherwise use existing items
      const itemsToUse = updatedFields.items || currentOrder.items;
      const vatRate = updateOrderDto.vat !== undefined ? updateOrderDto.vat : currentOrder.vatRate;
      const shippingFee = updateOrderDto.shippingFee !== undefined ? updateOrderDto.shippingFee : currentOrder.shippingFee;

      // Use existing items from current order
      const subtotal = itemsToUse.reduce((sum, item) => {
        const itemTotal = typeof item.totalPrice === 'number' ? item.totalPrice : (item.quantity * item.unitPrice);
        return sum + itemTotal;
      }, 0);
      
      const vatAmount = subtotal * (vatRate / 100);
      const totalAmount = subtotal + vatAmount + shippingFee;

      // Add calculated fields to update
      updatedFields.subtotal = subtotal;
      updatedFields.vatRate = vatRate;
      updatedFields.vatAmount = vatAmount;
      updatedFields.shippingFee = shippingFee;
      updatedFields.totalAmount = totalAmount;

      console.log('🧮 Recalculated order totals:', {
        subtotal,
        vatRate,
        vatAmount,
        shippingFee,
        totalAmount
      });
    }

    const order = await this.orderModel.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true }
    ).populate('customerId', 'name phone address email')
    .populate('agentId', 'name phone address email')
    .populate('createdBy', 'username fullName')
    .populate('items.productId', 'code name currentPrice')
    .exec();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    console.log('📋 Order items after update:', order.items);

    // Transform để frontend có thể access đúng field names
    const transformedOrder = order.toObject() as any;
    transformedOrder.customer = transformedOrder.customerId;
    transformedOrder.agent = transformedOrder.agentId;
    
    // Transform items để frontend có thể access product info
    if (transformedOrder.items) {
      transformedOrder.items = transformedOrder.items.map(item => ({
        ...item,
        product: item.productId // Map productId to product for frontend compatibility
      }));
    }
    
    return transformedOrder;
  }

  async cancel(id: string, employeeId: string, employeeName: string): Promise<Order> {
    const order = await this.findOneForStockOperation(id);

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
    const now = TimezoneUtil.nowInVietnam();
    let currentPeriodStart: Date;
    let currentPeriodEnd: Date;
    let previousPeriodStart: Date;
    let previousPeriodEnd: Date;

    if (startDate && endDate) {
      // Nếu có date range custom - chuyển về UTC cho MongoDB
      currentPeriodStart = TimezoneUtil.startOfDayVietnam(startDate);
      currentPeriodEnd = TimezoneUtil.endOfDayVietnam(endDate);
      
      // Tính period trước có cùng độ dài
      const periodLength = endDate.getTime() - startDate.getTime();
      const previousEndDate = new Date(startDate.getTime() - 1);
      const previousStartDate = new Date(previousEndDate.getTime() - periodLength);
      
      previousPeriodStart = TimezoneUtil.startOfDayVietnam(previousStartDate);
      previousPeriodEnd = TimezoneUtil.endOfDayVietnam(previousEndDate);
    } else {
      // Mặc định: tháng hiện tại vs tháng trước (theo múi giờ VN)
      const vietnamDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      
      // Tháng hiện tại
      const currentMonthStart = new Date(vietnamDate.getFullYear(), vietnamDate.getMonth(), 1);
      currentPeriodStart = TimezoneUtil.startOfDayVietnam(currentMonthStart);
      currentPeriodEnd = TimezoneUtil.endOfDayVietnam(now);
      
      // Tháng trước
      const previousMonthStart = new Date(vietnamDate.getFullYear(), vietnamDate.getMonth() - 1, 1);
      const previousMonthEnd = new Date(vietnamDate.getFullYear(), vietnamDate.getMonth(), 0);
      
      previousPeriodStart = TimezoneUtil.startOfDayVietnam(previousMonthStart);
      previousPeriodEnd = TimezoneUtil.endOfDayVietnam(previousMonthEnd);
    }

    const filter: any = { status: OrderStatus.ACTIVE };

    // Stats for current period
    const currentStats = await this.orderModel.aggregate([
      { 
        $match: { 
          ...filter, 
          createdAt: { 
            $gte: currentPeriodStart, 
            $lte: currentPeriodEnd 
          } 
        } 
      },
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

    // Stats for previous period
    const previousStats = await this.orderModel.aggregate([
      { 
        $match: { 
          ...filter, 
          createdAt: { 
            $gte: previousPeriodStart, 
            $lte: previousPeriodEnd 
          } 
        } 
      },
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

    const current = currentStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalDebt: 0,
      completedRevenue: 0
    };

    const previous = previousStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalDebt: 0,
      completedRevenue: 0
    };

    // Calculate percentage changes
    const calculatePercentageChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 100) / 100; // Round to 2 decimal places
    };

    const revenueChange = calculatePercentageChange(current.totalRevenue, previous.totalRevenue);
    const ordersChange = calculatePercentageChange(current.totalOrders, previous.totalOrders);
    
    // Tính lợi nhuận ước tính (doanh thu - chi phí ước tính)
    // Giả sử lợi nhuận = 30% doanh thu
    current.estimatedProfit = current.completedRevenue * 0.3;

    return {
      ...current,
      changes: {
        revenueChange,
        ordersChange,
        revenueChangeFormatted: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
        ordersChangeFormatted: `${ordersChange >= 0 ? '+' : ''}${ordersChange}%`
      },
      previousPeriod: previous,
      periodInfo: {
        currentStart: currentPeriodStart,
        currentEnd: currentPeriodEnd,
        previousStart: previousPeriodStart,
        previousEnd: previousPeriodEnd
      }
    };
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

  async remove(id: string, employeeId: string, employeeName: string): Promise<void> {
    const order = await this.findOneForStockOperation(id);

    // Hoàn trả kho nếu đơn hàng đang active
    if (order.status === OrderStatus.ACTIVE) {
      for (const item of order.items) {
        await this.stockService.returnStock(
          item.productId.toString(),
          item.quantity,
          id,
          employeeId,
          employeeName
        );
      }
    }

    // Xóa vĩnh viễn đơn hàng
    const result = await this.orderModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
  }
}
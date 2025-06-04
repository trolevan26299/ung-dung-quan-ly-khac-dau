import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { Customer, CustomerDocument } from '../../schemas/customer.schema';
import { Agent, AgentDocument } from '../../schemas/agent.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { 
  OrderStats, 
  ProductStats, 
  CustomerStats, 
  AgentStats,
  StatisticsPeriod,
  OrderStatus,
  PaymentStatus 
} from '../../types/common.types';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // Thống kê tổng quan
  async getOverviewStats(period?: StatisticsPeriod): Promise<{
    orders: OrderStats;
    products: ProductStats;
    customers: CustomerStats;
    agents: AgentStats;
  }> {
    const dateFilter = this.buildDateFilter(period);

    const [orderStats, productStats, customerStats, agentStats] = await Promise.all([
      this.getOrderStats(dateFilter),
      this.getProductStats(),
      this.getCustomerStats(dateFilter),
      this.getAgentStats(dateFilter)
    ]);

    return {
      orders: orderStats,
      products: productStats,
      customers: customerStats,
      agents: agentStats
    };
  }

  // Thống kê đơn hàng
  private async getOrderStats(dateFilter: any): Promise<OrderStats> {
    const filter = { 
      status: OrderStatus.ACTIVE,
      ...dateFilter 
    };

    const stats = await this.orderModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalDebt: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', PaymentStatus.DEBT] }, '$totalAmount', 0]
            }
          },
          completedRevenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', PaymentStatus.COMPLETED] }, '$totalAmount', 0]
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

    // Tính lợi nhuận ước tính (30% doanh thu)
    const totalProfit = result.completedRevenue * 0.3;

    return {
      totalOrders: result.totalOrders,
      totalRevenue: result.totalRevenue,
      totalDebt: result.totalDebt,
      totalProfit
    };
  }

  // Thống kê sản phẩm
  private async getProductStats(): Promise<ProductStats> {
    const totalProducts = await this.productModel.countDocuments({});
    
    const lowStockProducts = await this.productModel.countDocuments({
      $expr: { $lte: ['$stockQuantity', '$minStock'] }
    });

    const stockValueResult = await this.productModel.aggregate([
      { $match: {} },
      {
        $group: {
          _id: null,
          totalStockValue: {
            $sum: { $multiply: ['$stockQuantity', '$avgImportPrice'] }
          }
        }
      }
    ]);

    const totalStockValue = stockValueResult[0]?.totalStockValue || 0;

    return {
      totalProducts,
      lowStockProducts,
      totalStockValue
    };
  }

  // Thống kê khách hàng
  private async getCustomerStats(dateFilter: any): Promise<CustomerStats> {
    const totalCustomers = await this.customerModel.countDocuments({});

    const topCustomerResult = await this.orderModel.aggregate([
      { 
        $match: { 
          status: OrderStatus.ACTIVE,
          customerId: { $exists: true },
          ...dateFilter 
        } 
      },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$totalAmount' },
          customerName: { $first: '$customerName' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 1 }
    ]);

    const topCustomer = topCustomerResult[0] ? {
      id: topCustomerResult[0]._id,
      name: topCustomerResult[0].customerName,
      totalSpent: topCustomerResult[0].totalSpent
    } : {
      id: '',
      name: 'Chưa có',
      totalSpent: 0
    };

    return {
      totalCustomers,
      topCustomer
    };
  }

  // Thống kê đại lý
  private async getAgentStats(dateFilter: any): Promise<AgentStats> {
    const totalAgents = await this.agentModel.countDocuments({});

    const topAgentResult = await this.orderModel.aggregate([
      { 
        $match: { 
          status: OrderStatus.ACTIVE,
          agentId: { $exists: true },
          ...dateFilter 
        } 
      },
      {
        $group: {
          _id: '$agentId',
          totalSales: { $sum: '$totalAmount' },
          agentName: { $first: '$agentName' }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 1 }
    ]);

    const topAgent = topAgentResult[0] ? {
      id: topAgentResult[0]._id,
      name: topAgentResult[0].agentName,
      totalSales: topAgentResult[0].totalSales
    } : {
      id: '',
      name: 'Chưa có',
      totalSales: 0
    };

    return {
      totalAgents,
      topAgent
    };
  }

  // Doanh thu theo thời gian
  async getRevenueByPeriod(period: 'month' | 'quarter' | 'year', year?: number): Promise<any[]> {
    const currentYear = year || new Date().getFullYear();
    
    let groupBy: any;
    let matchCondition: any = {
      status: OrderStatus.ACTIVE,
      paymentStatus: PaymentStatus.COMPLETED,
      createdAt: {
        $gte: new Date(currentYear, 0, 1),
        $lt: new Date(currentYear + 1, 0, 1)
      }
    };

    switch (period) {
      case 'month':
        groupBy = { $month: '$createdAt' };
        break;
      case 'quarter':
        groupBy = {
          $switch: {
            branches: [
              { case: { $lte: [{ $month: '$createdAt' }, 3] }, then: 1 },
              { case: { $lte: [{ $month: '$createdAt' }, 6] }, then: 2 },
              { case: { $lte: [{ $month: '$createdAt' }, 9] }, then: 3 },
            ],
            default: 4
          }
        };
        break;
      case 'year':
        groupBy = { $year: '$createdAt' };
        matchCondition = {
          status: OrderStatus.ACTIVE,
          paymentStatus: PaymentStatus.COMPLETED,
          createdAt: { $gte: new Date(currentYear - 4, 0, 1) }
        };
        break;
    }

    return this.orderModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
  }

  // Top khách hàng
  async getTopCustomers(limit: number = 10, period?: StatisticsPeriod): Promise<any[]> {
    const dateFilter = this.buildDateFilter(period);
    
    return this.orderModel.aggregate([
      { 
        $match: { 
          status: OrderStatus.ACTIVE,
          customerId: { $exists: true },
          ...dateFilter 
        } 
      },
      {
        $group: {
          _id: '$customerId',
          customerName: { $first: '$customerName' },
          customerPhone: { $first: '$customerPhone' },
          totalSpent: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit }
    ]);
  }

  // Top đại lý
  async getTopAgents(limit: number = 10, period?: StatisticsPeriod): Promise<any[]> {
    const dateFilter = this.buildDateFilter(period);
    
    return this.orderModel.aggregate([
      { 
        $match: { 
          status: OrderStatus.ACTIVE,
          agentId: { $exists: true },
          ...dateFilter 
        } 
      },
      {
        $group: {
          _id: '$agentId',
          agentName: { $first: '$agentName' },
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: limit }
    ]);
  }

  // Top sản phẩm bán chạy
  async getTopSellingProducts(limit: number = 10, period?: StatisticsPeriod): Promise<any[]> {
    const dateFilter = this.buildDateFilter(period);
    
    return this.orderModel.aggregate([
      { 
        $match: { 
          status: OrderStatus.ACTIVE,
          ...dateFilter 
        } 
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
          avgPrice: { $avg: '$items.unitPrice' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productCode: '$product.code',
          productName: '$product.name',
          totalQuantity: 1,
          totalRevenue: 1,
          avgPrice: 1,
          currentStock: '$product.stockQuantity'
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit }
    ]);
  }

  // Báo cáo công nợ
  async getDebtReport(): Promise<any> {
    const debtOrders = await this.orderModel.aggregate([
      { 
        $match: { 
          status: OrderStatus.ACTIVE,
          paymentStatus: { $in: [PaymentStatus.PENDING, PaymentStatus.DEBT] }
        } 
      },
      {
        $group: {
          _id: {
            customerId: '$customerId',
            agentId: '$agentId'
          },
          customerName: { $first: '$customerName' },
          agentName: { $first: '$agentName' },
          totalDebt: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          oldestOrder: { $min: '$createdAt' }
        }
      },
      { $sort: { totalDebt: -1 } }
    ]);

    const totalDebt = debtOrders.reduce((sum, item) => sum + item.totalDebt, 0);

    return {
      totalDebt,
      debtCount: debtOrders.length,
      debtOrders
    };
  }

  // Xây dựng bộ lọc ngày
  private buildDateFilter(period?: StatisticsPeriod): any {
    if (!period) return {};

    const now = new Date();
    let startDate: Date;
    let endDate: Date = period.endDate || now;

    if (period.startDate) {
      startDate = period.startDate;
    } else {
      switch (period.period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          return {};
      }
    }

    return {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };
  }
} 
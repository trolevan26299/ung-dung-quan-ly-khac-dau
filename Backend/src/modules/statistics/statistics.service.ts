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
import { TimezoneUtil } from '../../utils/timezone.util';

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

    // Tổng doanh thu từ tất cả đơn hàng active
    const totalStats = await this.orderModel.aggregate([
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

    const result = totalStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalDebt: 0,
      completedRevenue: 0
    };

    // Tính lợi nhuận thực tế dựa trên giá nhập - sử dụng logic tương tự getRevenueByPeriod
    const profitStats = await this.orderModel.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      {
        $addFields: {
          'items.productObjectId': {
            $cond: {
              if: { $type: '$items.productId' },
              then: {
                $cond: {
                  if: { $eq: [{ $type: '$items.productId' }, 'objectId'] },
                  then: '$items.productId',
                  else: { $toObjectId: '$items.productId' }
                }
              },
              else: null
            }
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productObjectId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalCost: {
            $sum: {
              $multiply: [
                '$items.quantity',
                { $ifNull: ['$product.avgImportPrice', 0] }
              ]
            }
          },
          totalSalesValue: {
            $sum: {
              $multiply: ['$items.quantity', '$items.unitPrice']
            }
          },
          // Debug: count products found
          productsFound: {
            $sum: {
              $cond: [{ $ne: ['$product', null] }, 1, 0]
            }
          },
          totalItems: { $sum: 1 }
        }
      }
    ]);

    const profitResult = profitStats[0] || {
      totalCost: 0,
      totalSalesValue: 0,
      productsFound: 0,
      totalItems: 0
    };

    console.log('🔍 Profit Debug Enhanced:', {
      filter,
      profitStatsLength: profitStats.length,
      profitStats,
      profitResult,
      totalCost: profitResult.totalCost,
      totalSalesValue: profitResult.totalSalesValue,
      productsFound: profitResult.productsFound,
      totalItems: profitResult.totalItems
    });

    // Debug: Kiểm tra có orders nào match filter không
    const ordersCount = await this.orderModel.countDocuments(filter);
    console.log('📊 Orders matching filter:', ordersCount);

    // Debug: Kiểm tra orders có items không và có productId hợp lệ không
    const ordersWithItems = await this.orderModel.find(filter).select('items').limit(2);
    console.log('📦 Sample orders with items:', JSON.stringify(ordersWithItems, null, 2));

    // Debug: Kiểm tra aggregation từng bước
    const stepByStep = await this.orderModel.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      { $limit: 3 },
      {
        $addFields: {
          'items.productObjectId': {
            $cond: {
              if: { $type: '$items.productId' },
              then: {
                $cond: {
                  if: { $eq: [{ $type: '$items.productId' }, 'objectId'] },
                  then: '$items.productId',
                  else: { $toObjectId: '$items.productId' }
                }
              },
              else: null
            }
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productObjectId', 
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $project: {
          'items.productId': 1,
          'items.productObjectId': 1,
          'items.quantity': 1,
          'items.unitPrice': 1,
          'product.avgImportPrice': 1,
          'product.name': 1,
          createdAt: 1
        }
      }
    ]);
    console.log('🔍 Step by step debug:', JSON.stringify(stepByStep, null, 2));

    const totalProfit = profitResult.totalSalesValue - profitResult.totalCost;

    return {
      totalOrders: result.totalOrders,
      totalRevenue: result.totalRevenue, // Tổng tất cả đơn hàng
      totalDebt: result.totalDebt,
      totalProfit: Math.max(0, totalProfit) // Lợi nhuận thực tế, không âm
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
      status: OrderStatus.ACTIVE, // Tính tất cả đơn hàng active, bao gồm cả công nợ
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
          status: OrderStatus.ACTIVE, // Tính tất cả đơn hàng active, bao gồm cả công nợ
          createdAt: { $gte: new Date(currentYear - 4, 0, 1) }
        };
        break;
    }

    // Tối ưu: Sử dụng aggregation để tính profit luôn thay vì loop
    // Lấy doanh thu theo tháng
    const revenueData = await this.orderModel.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
          completedRevenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', PaymentStatus.COMPLETED] }, '$totalAmount', 0]
            }
          },
          debtRevenue: {
            $sum: {
              $cond: [{ $in: ['$paymentStatus', [PaymentStatus.PENDING, PaymentStatus.DEBT]] }, '$totalAmount', 0]
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Tính lợi nhuận riêng cho từng tháng
    const profitData = await this.orderModel.aggregate([
      { $match: matchCondition },
      { $unwind: '$items' },
      {
        $addFields: {
          'items.productObjectId': {
            $cond: {
              if: { $type: '$items.productId' },
              then: {
                $cond: {
                  if: { $eq: [{ $type: '$items.productId' }, 'objectId'] },
                  then: '$items.productId',
                  else: { $toObjectId: '$items.productId' }
                }
              },
              else: null
            }
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productObjectId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: groupBy,
          totalCost: {
            $sum: {
              $multiply: [
                '$items.quantity',
                { $ifNull: ['$product.avgImportPrice', 0] }
              ]
            }
          },
          totalSalesValue: {
            $sum: {
              $multiply: ['$items.quantity', '$items.unitPrice']
            }
          }
        }
      }
    ]);

    // Kết hợp doanh thu và lợi nhuận
    const result = revenueData.map(monthRevenue => {
      const monthProfit = profitData.find(p => p._id === monthRevenue._id);
      const profit = monthProfit 
        ? Math.max(0, monthProfit.totalSalesValue - monthProfit.totalCost)
        : 0;

      return {
        ...monthRevenue,
        profit
      };
    });

    console.log('📊 Revenue by period result:', result);
    return result;
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
    console.log('🔍 buildDateFilter input:', {
      period,
      hasStartDate: !!period?.startDate,
      hasEndDate: !!period?.endDate,
      startDateValue: period?.startDate,
      endDateValue: period?.endDate
    });

    if (!period) return {};

    let startDate: Date;
    const now = TimezoneUtil.nowInVietnam();
    const vietnamDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

    if (period.startDate) {
      startDate = TimezoneUtil.startOfDayVietnam(period.startDate);
    } else {
      switch (period.period) {
        case 'day':
          startDate = TimezoneUtil.startOfDayVietnam(vietnamDate);
          break;
        case 'week':
          startDate = new Date(vietnamDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          startDate = TimezoneUtil.startOfDayVietnam(startDate);
          break;
        case 'month':
          startDate = new Date(vietnamDate.getFullYear(), vietnamDate.getMonth(), 1);
          startDate = TimezoneUtil.startOfDayVietnam(startDate);
          break;
        case 'quarter':
          const quarterStart = Math.floor(vietnamDate.getMonth() / 3) * 3;
          startDate = new Date(vietnamDate.getFullYear(), quarterStart, 1);
          startDate = TimezoneUtil.startOfDayVietnam(startDate);
          break;
        case 'year':
          startDate = new Date(vietnamDate.getFullYear(), 0, 1);
          startDate = TimezoneUtil.startOfDayVietnam(startDate);
          break;
        default:
          startDate = TimezoneUtil.startOfDayVietnam(vietnamDate);
      }
    }

    const endDate = period.endDate 
      ? TimezoneUtil.endOfDayVietnam(period.endDate)
      : TimezoneUtil.endOfDayVietnam(now);

    const filter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    console.log('🔍 buildDateFilter output:', {
      filter,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    return filter;
  }

  // Thống kê cho frontend (trả về đúng structure mà frontend mong đợi)
  async getStatisticsForFrontend(period?: StatisticsPeriod): Promise<{
    totalRevenue: number;
    totalProfit: number;
    totalDebt: number;
    totalOrders: number;
    topCustomers: Array<{
      customer: any;
      totalAmount: number;
      totalOrders: number;
    }>;
    topAgents: Array<{
      agent: any;
      totalAmount: number;
      totalOrders: number;
    }>;
    topProducts: Array<{
      product: any;
      totalSold: number;
      totalRevenue: number;
    }>;
    revenueByMonth: Array<{
      month: string;
      revenue: number;
      profit: number;
    }>;
  }> {
    const dateFilter = this.buildDateFilter(period);
    console.log('🔍 Date Filter Debug:', { period, dateFilter });

    // Lấy thống kê cơ bản từ orders
    const orderStats = await this.getOrderStats(dateFilter);
    
    // Lấy top customers với full data
    const topCustomers = await this.getTopCustomersWithFullData(5, period);
    console.log('👥 Top Customers Count:', topCustomers.length);
    
    // Lấy top agents với full data
    const topAgents = await this.getTopAgentsWithFullData(5, period);
    console.log('🏢 Top Agents Count:', topAgents.length);
    
    // Lấy top products với full data
    const topProducts = await this.getTopProductsWithFullData(5, period);
    console.log('📦 Top Products Count:', topProducts.length);
    
    // Lấy revenue by month và transform format (KHÔNG áp dụng date filter - độc lập)
    const rawRevenueData = await this.getRevenueByPeriod('month');
    const revenueByMonth = this.transformRevenueData(rawRevenueData);

    return {
      totalRevenue: orderStats.totalRevenue,
      totalProfit: orderStats.totalProfit,
      totalDebt: orderStats.totalDebt,
      totalOrders: orderStats.totalOrders,
      topCustomers,
      topAgents,
      topProducts,
      revenueByMonth
    };
  }

  // Transform revenue data to frontend format
  private transformRevenueData(rawData: any[]): Array<{
    month: string;
    revenue: number;
    profit: number;
  }> {
    // Tạo map với 12 tháng, tất cả bắt đầu với giá trị 0
    const monthsMap = new Map();
    for (let i = 1; i <= 12; i++) {
      monthsMap.set(i, {
        month: `Tháng ${i}`,
        revenue: 0,
        profit: 0
      });
    }

    // Fill data thực từ rawData nếu có
    if (rawData && rawData.length > 0) {
      rawData.forEach(item => {
        if (item._id && item._id >= 1 && item._id <= 12) {
          const revenue = item.totalRevenue || 0; // Tổng doanh thu bao gồm cả công nợ
          const profit = item.profit || 0; // Lợi nhuận thực tế đã tính
          monthsMap.set(item._id, {
            month: `Tháng ${item._id}`,
            revenue,
            profit
          });
        }
      });
    }

    // Trả về array theo thứ tự tháng (1-12)
    return Array.from(monthsMap.values());
  }

  // Top customers với full customer data
  private async getTopCustomersWithFullData(limit: number = 5, period?: StatisticsPeriod) {
    const dateFilter = this.buildDateFilter(period);

    const pipeline: any[] = [
      { 
        $match: { 
          status: 'active',
          customerId: { $exists: true },
          ...dateFilter 
        } 
      },
      {
        $group: {
          _id: '$customerId',
          totalAmount: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'customers',
          let: { customerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$_id', '$$customerId'] },
                    { $eq: [{ $toString: '$_id' }, { $toString: '$$customerId' }] },
                    { $eq: ['$_id', { $toString: '$$customerId' }] }
                  ]
                }
              }
            }
          ],
          as: 'customer'
        }
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      { $sort: { totalAmount: -1 } },
      { $limit: limit },
      {
        $project: {
          customer: {
            _id: '$customer._id',
            name: '$customer.name',
            phone: '$customer.phone',
            address: '$customer.address'
          },
          totalAmount: 1,
          totalOrders: 1
        }
      }
    ];

    return this.orderModel.aggregate(pipeline);
  }

  // Top agents với full agent data
  private async getTopAgentsWithFullData(limit: number = 5, period?: StatisticsPeriod) {
    const dateFilter = this.buildDateFilter(period);

    const pipeline: any[] = [
      { 
        $match: { 
          status: 'active',
          agentId: { $exists: true },
          ...dateFilter 
        } 
      },
      {
        $group: {
          _id: '$agentId',
          totalAmount: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'agents',
          let: { agentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$_id', '$$agentId'] },
                    { $eq: [{ $toString: '$_id' }, { $toString: '$$agentId' }] },
                    { $eq: ['$_id', { $toString: '$$agentId' }] }
                  ]
                }
              }
            }
          ],
          as: 'agent'
        }
      },
      { $unwind: { path: '$agent', preserveNullAndEmptyArrays: true } },
      { $sort: { totalAmount: -1 } },
      { $limit: limit },
      {
        $project: {
          agent: {
            _id: '$agent._id',
            name: '$agent.name',
            phone: '$agent.phone',
            address: '$agent.address'
          },
          totalAmount: 1,
          totalOrders: 1
        }
      }
    ];

    return this.orderModel.aggregate(pipeline);
  }

  // Top products với full product data
  private async getTopProductsWithFullData(limit: number = 5, period?: StatisticsPeriod) {
    const dateFilter = this.buildDateFilter(period);

    const pipeline: any[] = [
      { 
        $match: { 
          status: 'active',
          ...dateFilter 
        } 
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'products',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$_id', '$$productId'] },
                    { $eq: [{ $toString: '$_id' }, { $toString: '$$productId' }] },
                    { $eq: ['$_id', { $toString: '$$productId' }] }
                  ]
                }
              }
            }
          ],
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
      {
        $project: {
          product: {
            _id: '$product._id',
            name: '$product.name',
            code: '$product.code',
            currentPrice: '$product.currentPrice'
          },
          totalSold: 1,
          totalRevenue: 1
        }
      }
    ];

    return this.orderModel.aggregate(pipeline);
  }

  // Lấy dữ liệu doanh thu theo năm
  async getYearlyRevenue(year?: number): Promise<any[]> {
    const currentYear = year || new Date(TimezoneUtil.nowInVietnam().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })).getFullYear();

    return this.orderModel.aggregate([
      {
        $match: {
          status: OrderStatus.ACTIVE,
          paymentStatus: PaymentStatus.COMPLETED,
          $gte: new Date(currentYear, 0, 1),
          $lt: new Date(currentYear + 1, 0, 1)
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
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockTransaction, StockTransactionDocument } from '../../schemas/stock-transaction.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateStockTransactionDto, ImportStockDto, AdjustStockDto, StockReportQueryDto } from './dto/stock.dto';
import { PaginationResult, TransactionType } from '../../types/common.types';
import { TimezoneUtil } from '../../utils/timezone.util';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(StockTransaction.name) private stockTransactionModel: Model<StockTransactionDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // Helper method để cleanup và fix bad userId data 
  private async fixSystemUserIds(): Promise<void> {
    try {
      // Tìm hoặc tạo system user
      let systemUser = await this.productModel.db.collection('users').findOne({ username: 'system' });
      
      if (!systemUser) {
        const result = await this.productModel.db.collection('users').insertOne({
          username: 'system',
          fullName: 'System User',
          password: 'system',
          role: 'admin',
          isActive: true,
          createdAt: TimezoneUtil.nowInVietnam(),
          updatedAt: TimezoneUtil.nowInVietnam()
        });
        systemUser = { _id: result.insertedId };
      }

      // Update all stock transactions với userId = 'system' thành system user ObjectId
      await this.stockTransactionModel.updateMany(
        { userId: 'system' },
        { userId: systemUser._id }
      ).exec();

      console.log('✅ Fixed system userId in stock transactions');
    } catch (error) {
      console.error('❌ Error fixing system userId:', error);
    }
  }

  // Tạo giao dịch kho
  async createTransaction(createStockTransactionDto: CreateStockTransactionDto, userId: string, userName: string): Promise<StockTransaction> {
    const product = await this.productModel.findById(createStockTransactionDto.product);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const stockBefore = product.stockQuantity;
    let quantity = createStockTransactionDto.quantity;
    let stockAfter: number;
    
    // Xử lý logic khác nhau cho từng loại giao dịch
    if (createStockTransactionDto.type === TransactionType.ADJUSTMENT) {
      // Điều chỉnh: set trực tiếp số lượng tồn kho mới
      stockAfter = quantity;
      quantity = stockAfter - stockBefore; // Tính số lượng thay đổi để lưu vào transaction
    } else {
      // Nhập/Xuất kho: cộng/trừ như cũ
      if (createStockTransactionDto.type === TransactionType.EXPORT) {
        quantity = -Math.abs(quantity);
      }
      stockAfter = stockBefore + quantity;
    }

    if (stockAfter < 0) {
      throw new Error('Số lượng tồn kho không thể âm');
    }

    // Chuẩn bị update data
    const updateData: any = { stockQuantity: stockAfter };

    // Cập nhật giá nhập trung bình cho giao dịch nhập kho
    if (createStockTransactionDto.type === TransactionType.IMPORT && createStockTransactionDto.unitPrice !== undefined && createStockTransactionDto.unitPrice !== null) {
      const currentAvgPrice = product.avgImportPrice || 0;
      const totalCurrentValue = stockBefore * currentAvgPrice;
      const newImportValue = Math.abs(quantity) * createStockTransactionDto.unitPrice;
      const newAvgImportPrice = stockBefore === 0 ? 
        createStockTransactionDto.unitPrice : 
        (totalCurrentValue + newImportValue) / stockAfter;
      
      updateData.avgImportPrice = newAvgImportPrice;
    }

    // Cập nhật sản phẩm
    await this.productModel.findByIdAndUpdate(
      createStockTransactionDto.product,
      updateData
    );

    // Tạo transaction record
    const transaction = new this.stockTransactionModel({
      productId: createStockTransactionDto.product,
      productCode: product.code,
      productName: product.name,
      transactionType: createStockTransactionDto.type,
      quantity,
      unitPrice: createStockTransactionDto.type === TransactionType.IMPORT ? (createStockTransactionDto.unitPrice || 0) : 0,
      userId,
      userName,
      stockBefore,
      stockAfter,
      reason: createStockTransactionDto.reason,
      notes: createStockTransactionDto.notes,
      totalValue: createStockTransactionDto.type === TransactionType.IMPORT ? (Math.abs(quantity) * (createStockTransactionDto.unitPrice || 0)) : 0
    });

    return transaction.save();
  }

  // Nhập kho
  async importStock(importStockDto: ImportStockDto, userId: string, userName: string): Promise<StockTransaction> {
    const product = await this.productModel.findOne({ code: importStockDto.productCode });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm với mã: ' + importStockDto.productCode);
    }

    const stockBefore = product.stockQuantity;
    const stockAfter = stockBefore + importStockDto.quantity;

    // Cập nhật giá nhập trung bình
    const currentAvgPrice = product.avgImportPrice || 0;
    const totalCurrentValue = stockBefore * currentAvgPrice;
    const newImportValue = importStockDto.quantity * importStockDto.unitPrice;
    const newAvgImportPrice = stockBefore === 0 ? 
      importStockDto.unitPrice : 
      (totalCurrentValue + newImportValue) / stockAfter;

    // Cập nhật sản phẩm
    await this.productModel.findByIdAndUpdate(product._id, {
      stockQuantity: stockAfter,
      avgImportPrice: newAvgImportPrice
    });

    // Tạo transaction record
    const transaction = new this.stockTransactionModel({
      productId: product._id,
      productCode: product.code,
      productName: product.name,
      transactionType: TransactionType.IMPORT,
      quantity: importStockDto.quantity,
      unitPrice: importStockDto.unitPrice,
      totalValue: newImportValue,
      userId,
      userName,
      stockBefore,
      stockAfter,
      reason: importStockDto.reason || 'Nhập kho',
      notes: importStockDto.notes
    });

    return transaction.save();
  }

  // Điều chỉnh kho
  async adjustStock(adjustStockDto: AdjustStockDto, userId: string, userName: string): Promise<StockTransaction> {
    const product = await this.productModel.findOne({ code: adjustStockDto.productCode });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm với mã: ' + adjustStockDto.productCode);
    }

    const stockBefore = product.stockQuantity;
    const stockAfter = stockBefore + adjustStockDto.quantity;

    if (stockAfter < 0) {
      throw new Error('Số lượng tồn kho không đủ để điều chỉnh');
    }

    // Cập nhật tồn kho
    await this.productModel.findByIdAndUpdate(product._id, {
      stockQuantity: stockAfter
    });

    // Tạo transaction record
    const transaction = new this.stockTransactionModel({
      productId: product._id,
      productCode: product.code,
      productName: product.name,
      transactionType: TransactionType.ADJUSTMENT,
      quantity: adjustStockDto.quantity,
      unitPrice: 0,
      totalValue: 0,
      userId,
      userName,
      stockBefore,
      stockAfter,
      reason: adjustStockDto.reason,
      notes: adjustStockDto.notes
    });

    return transaction.save();
  }

  // Xuất kho (cho đơn hàng)
  async exportStock(productId: string, quantity: number, orderId: string, userId: string, userName: string, unitPrice?: number): Promise<StockTransaction> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const stockBefore = product.stockQuantity;
    if (stockBefore < quantity) {
      throw new Error(`Không đủ hàng trong kho. Tồn kho hiện tại: ${stockBefore}, yêu cầu: ${quantity}`);
    }

    const stockAfter = stockBefore - quantity;

    // Cập nhật tồn kho
    await this.productModel.findByIdAndUpdate(productId, {
      stockQuantity: stockAfter
    });

    // Sử dụng unitPrice từ đơn hàng nếu có, nếu không thì dùng giá hiện tại của sản phẩm
    const priceToUse = unitPrice || product.currentPrice || 0;
    const totalValue = priceToUse * quantity;

    // Tạo transaction record
    const transaction = new this.stockTransactionModel({
      productId,
      productCode: product.code,
      productName: product.name,
      transactionType: TransactionType.EXPORT,
      quantity: -quantity, // Số âm cho xuất kho
      unitPrice: priceToUse,
      totalValue: totalValue,
      orderId,
      userId,
      userName,
      stockBefore,
      stockAfter,
      reason: 'Xuất kho cho đơn hàng'
    });

    return transaction.save();
  }

  // Hoàn trả kho (khi hủy đơn hàng)
  async returnStock(productId: string, quantity: number, orderId: string, userId: string, userName: string): Promise<StockTransaction> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const stockBefore = product.stockQuantity;
    const stockAfter = stockBefore + quantity;

    // Cập nhật tồn kho
    await this.productModel.findByIdAndUpdate(productId, {
      stockQuantity: stockAfter
    });

    // Tạo transaction record
    const transaction = new this.stockTransactionModel({
      productId,
      productCode: product.code,
      productName: product.name,
      transactionType: TransactionType.IMPORT,
      quantity: quantity,
      unitPrice: 0,
      totalValue: 0,
      orderId,
      userId,
      userName,
      stockBefore,
      stockAfter,
      reason: 'Hoàn trả kho do hủy đơn hàng'
    });

    return transaction.save();
  }

  // Lấy báo cáo giao dịch kho
  async getStockReport(query: StockReportQueryDto = {}): Promise<PaginationResult<StockTransaction>> {
    const { page = 1, limit = 10, search, transactionType, productId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    // Fix any bad userId data first
    await this.fixSystemUserIds();

    const filter: any = {};

    if (search) {
      filter.$or = [
        { productCode: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }

    if (transactionType) {
      filter.transactionType = transactionType;
    }

    if (productId) {
      filter.productId = productId;
    }

    // Date filter
    if (startDate || endDate) {
      const dateFilter = TimezoneUtil.createDateRangeFilter(startDate, endDate);
      if (dateFilter.createdAt) {
        filter.transactionDate = dateFilter.createdAt;
      }
    }

    try {
      const [data, total] = await Promise.all([
        this.stockTransactionModel
          .find(filter)
          .populate('userId', 'username fullName role')
          .sort({ transactionDate: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.stockTransactionModel.countDocuments(filter),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('❌ Error in getStockReport:', error);
      // Fallback: return data without populate if populate fails
      const [data, total] = await Promise.all([
        this.stockTransactionModel
          .find(filter)
          .sort({ transactionDate: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.stockTransactionModel.countDocuments(filter),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  }

  // Lấy lịch sử giao dịch của sản phẩm
  async getProductTransactionHistory(productId: string): Promise<StockTransaction[]> {
    await this.fixSystemUserIds();
    
    try {
      return this.stockTransactionModel
        .find({ productId })
        .populate('userId', 'username fullName role')
        .sort({ transactionDate: -1 })
        .exec();
    } catch (error) {
      console.error('❌ Error in getProductTransactionHistory:', error);
      // Fallback: return data without populate if populate fails
      return this.stockTransactionModel
        .find({ productId })
        .sort({ transactionDate: -1 })
        .exec();
    }
  }

  // Thống kê tồn kho
  async getStockSummary(): Promise<any> {
    const totalProducts = await this.productModel.countDocuments({});
    const lowStockProducts = await this.productModel.countDocuments({
      $expr: { $lte: ['$stockQuantity', '$minStock'] }
    });

    const stockValue = await this.productModel.aggregate([
      { $match: {} },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ['$stockQuantity', '$avgImportPrice'] }
          }
        }
      }
    ]);

    return {
      totalProducts,
      lowStockProducts,
      totalStockValue: stockValue[0]?.totalValue || 0
    };
  }
} 
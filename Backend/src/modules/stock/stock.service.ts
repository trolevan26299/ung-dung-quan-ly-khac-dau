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

    // Tính giá có VAT cho nhập kho
    let finalUnitPrice = createStockTransactionDto.unitPrice || 0;
    let totalImportValue = 0;
    
    if (createStockTransactionDto.type === TransactionType.IMPORT && finalUnitPrice > 0) {
      // Frontend đã tính VAT và gửi finalUnitPrice rồi, không cần tính lại
      // const vatRate = createStockTransactionDto.vat || 0;
      // const vatAmount = finalUnitPrice * (vatRate / 100);
      // finalUnitPrice = finalUnitPrice + vatAmount; // Giá đã bao gồm VAT
      
      // Cập nhật giá nhập trung bình
      const currentAvgPrice = product.avgImportPrice || 0;
      const totalCurrentValue = stockBefore * currentAvgPrice;
      totalImportValue = Math.abs(quantity) * finalUnitPrice;
      const newAvgImportPrice = stockBefore === 0 ? 
        finalUnitPrice : 
        (totalCurrentValue + totalImportValue) / stockAfter;
      
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
      unitPrice: createStockTransactionDto.type === TransactionType.IMPORT ? finalUnitPrice : 0,
      vat: createStockTransactionDto.vat || 0,
      userId,
      userName,
      stockBefore,
      stockAfter,
      reason: createStockTransactionDto.reason,
      notes: createStockTransactionDto.notes,
      totalValue: createStockTransactionDto.type === TransactionType.IMPORT ? totalImportValue : 0
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

    // Tính giá có VAT
    const vatRate = importStockDto.vat || 0;
    const vatAmount = importStockDto.unitPrice * (vatRate / 100);
    const finalUnitPrice = importStockDto.unitPrice + vatAmount; // Giá đã bao gồm VAT

    // Cập nhật giá nhập trung bình
    const currentAvgPrice = product.avgImportPrice || 0;
    const totalCurrentValue = stockBefore * currentAvgPrice;
    const newImportValue = importStockDto.quantity * finalUnitPrice;
    const newAvgImportPrice = stockBefore === 0 ? 
      finalUnitPrice : 
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
      unitPrice: finalUnitPrice, // Giá đã bao gồm VAT
      vat: vatRate,
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

  // Cập nhật giao dịch kho
  async updateTransaction(
    transactionId: string,
    updateData: Partial<any>,
    userId: string,
    userName: string
  ): Promise<StockTransaction> {
    // Tìm giao dịch cũ
    const oldTransaction = await this.stockTransactionModel.findById(transactionId);
    if (!oldTransaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    // Tìm sản phẩm
    const product = await this.productModel.findById(oldTransaction.productId);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    // Chỉ cho phép cập nhật các giao dịch import và adjustment
    // Không cho phép cập nhật export vì liên quan đến đơn hàng
    if (oldTransaction.transactionType === TransactionType.EXPORT && oldTransaction.orderId) {
      throw new Error('Không thể cập nhật giao dịch xuất kho của đơn hàng');
    }

    // Hoàn nguyên giao dịch cũ trước
    await this.revertTransactionEffect(oldTransaction, product);
    
    // Lấy lại product sau khi revert để có stock mới
    const productAfterRevert = await this.productModel.findById(oldTransaction.productId);

    // Áp dụng giao dịch mới
    const newQuantity = updateData.quantity !== undefined ? updateData.quantity : oldTransaction.quantity;
    const newUnitPrice = updateData.unitPrice !== undefined ? updateData.unitPrice : oldTransaction.unitPrice;
    const newVat = updateData.vat !== undefined ? updateData.vat : oldTransaction.vat;

    // Tính toán lại stock và avg price
    const stockBefore = productAfterRevert.stockQuantity;
    let stockAfter = stockBefore;
    let finalUnitPrice = newUnitPrice || 0;
    let totalValue = 0;
    const updateProductData: any = {};

    if (oldTransaction.transactionType === TransactionType.IMPORT) {
      stockAfter = stockBefore + Math.abs(newQuantity);
      
      if (finalUnitPrice > 0) {
        // Frontend đã tính VAT rồi, không cần cộng thêm
        // const vatRate = newVat || 0;
        // const vatAmount = finalUnitPrice * (vatRate / 100);
        // finalUnitPrice = finalUnitPrice + vatAmount;
        
        // Tính lại giá trung bình với đơn giá đã có VAT
        const currentAvgPrice = productAfterRevert.avgImportPrice || 0;
        const totalCurrentValue = stockBefore * currentAvgPrice;
        totalValue = Math.abs(newQuantity) * finalUnitPrice;
        const newAvgImportPrice = stockBefore === 0 ? 
          finalUnitPrice : 
          (totalCurrentValue + totalValue) / stockAfter;
        
        updateProductData.avgImportPrice = newAvgImportPrice;
      }
    } else if (oldTransaction.transactionType === TransactionType.ADJUSTMENT) {
      stockAfter = stockBefore + newQuantity;
      
      if (stockAfter < 0) {
        throw new Error('Số lượng tồn kho không đủ');
      }
    }

    updateProductData.stockQuantity = stockAfter;
    
    // Cập nhật sản phẩm
    await this.productModel.findByIdAndUpdate(oldTransaction.productId, updateProductData);

    // Cập nhật transaction
    const updatedTransaction = await this.stockTransactionModel.findByIdAndUpdate(
      transactionId,
      {
        quantity: oldTransaction.transactionType === TransactionType.IMPORT ? Math.abs(newQuantity) : newQuantity,
        unitPrice: finalUnitPrice,
        vat: newVat || 0,
        totalValue,
        stockBefore,
        stockAfter,
        reason: updateData.reason !== undefined ? updateData.reason : oldTransaction.reason,
        notes: updateData.notes !== undefined ? updateData.notes : oldTransaction.notes,
        updatedAt: new Date()
      },
      { new: true }
    );

    return updatedTransaction;
  }

  // Xóa giao dịch kho
  async deleteTransaction(transactionId: string, userId: string, userName: string): Promise<void> {
    // Tìm giao dịch
    const transaction = await this.stockTransactionModel.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    // Tìm sản phẩm
    const product = await this.productModel.findById(transaction.productId);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    // Chỉ cho phép xóa các giao dịch import và adjustment
    // Không cho phép xóa export vì liên quan đến đơn hàng
    if (transaction.transactionType === TransactionType.EXPORT && transaction.orderId) {
      throw new Error('Không thể xóa giao dịch xuất kho của đơn hàng');
    }

    // Hoàn nguyên giao dịch
    await this.revertTransactionEffect(transaction, product);

    // Xóa giao dịch
    await this.stockTransactionModel.findByIdAndDelete(transactionId);
  }

  // Helper method để hoàn nguyên hiệu ứng của giao dịch
  private async revertTransactionEffect(transaction: any, product: any): Promise<void> {
    const updateData: any = {};

    if (transaction.transactionType === TransactionType.IMPORT) {
      // Hoàn nguyên số lượng
      const newStockQuantity = product.stockQuantity - Math.abs(transaction.quantity);
      
      if (newStockQuantity < 0) {
        throw new Error('Không thể hoàn nguyên: số lượng tồn kho không đủ');
      }

      updateData.stockQuantity = newStockQuantity;

      // Hoàn nguyên giá trung bình nếu có
      if (transaction.unitPrice > 0 && transaction.totalValue > 0) {
        const currentTotalValue = product.stockQuantity * (product.avgImportPrice || 0);
        const valueToRemove = transaction.totalValue;
        
        if (newStockQuantity === 0) {
          updateData.avgImportPrice = 0;
        } else {
          const newAvgPrice = (currentTotalValue - valueToRemove) / newStockQuantity;
          updateData.avgImportPrice = newAvgPrice > 0 ? newAvgPrice : 0;
        }
      }
    } else if (transaction.transactionType === TransactionType.ADJUSTMENT) {
      // Hoàn nguyên điều chỉnh
      const newStockQuantity = product.stockQuantity - transaction.quantity;
      
      if (newStockQuantity < 0) {
        throw new Error('Không thể hoàn nguyên: số lượng tồn kho không đủ');
      }

      updateData.stockQuantity = newStockQuantity;
    }

    // Cập nhật sản phẩm
    await this.productModel.findByIdAndUpdate(transaction.productId, updateData);
  }
} 
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateProductDto, UpdateProductDto, ImportProductDto } from './dto/product.dto';
import { PaginationQuery, PaginationResult } from '../../types/common.types';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productModel.findOne({ code: createProductDto.code });
    if (existingProduct) {
      throw new ConflictException('Mã sản phẩm đã tồn tại');
    }

    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll(query: PaginationQuery = {}): Promise<PaginationResult<Product>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const filter: any = { isActive: true };
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product || !product.isActive) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return product;
  }

  async findByCode(code: string): Promise<Product> {
    const product = await this.productModel.findOne({ code, isActive: true }).exec();
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm với mã: ' + code);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true }
    ).exec();
    
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndUpdate(id, { isActive: false });
    if (!result) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
  }

  // Cập nhật số lượng tồn kho
  async updateStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      productId,
      { $inc: { stockQuantity: quantity } },
      { new: true }
    ).exec();

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return product;
  }

  // Cập nhật giá nhập trung bình
  async updateAvgImportPrice(productId: string, newImportPrice: number, quantity: number): Promise<Product> {
    const product = await this.findOne(productId);
    const currentStock = product.stockQuantity;
    const currentAvgPrice = product.avgImportPrice || 0;
    
    // Tính giá nhập trung bình mới
    const totalCurrentValue = currentStock * currentAvgPrice;
    const newImportValue = quantity * newImportPrice;
    const newTotalStock = currentStock + quantity;
    const newAvgImportPrice = (totalCurrentValue + newImportValue) / newTotalStock;

    return this.productModel.findByIdAndUpdate(
      productId,
      { 
        avgImportPrice: newAvgImportPrice,
        $inc: { stockQuantity: quantity }
      },
      { new: true }
    ).exec();
  }

  // Lấy sản phẩm sắp hết hàng
  async getLowStockProducts(): Promise<Product[]> {
    return this.productModel.find({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$minStock'] }
    }).exec();
  }

  // Lấy sản phẩm bán chạy nhất
  async getTopSellingProducts(limit: number = 10): Promise<any[]> {
    return this.productModel.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'orders',
          let: { productId: '$_id' },
          pipeline: [
            { $match: { status: 'active' } },
            { $unwind: '$items' },
            { $match: { $expr: { $eq: ['$items.productId', '$$productId'] } } }
          ],
          as: 'orderItems'
        }
      },
      {
        $addFields: {
          totalSold: {
            $sum: '$orderItems.items.quantity'
          },
          totalRevenue: {
            $sum: {
              $multiply: ['$orderItems.items.quantity', '$orderItems.items.unitPrice']
            }
          }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $project: {
          code: 1,
          name: 1,
          currentPrice: 1,
          stockQuantity: 1,
          totalSold: 1,
          totalRevenue: 1
        }
      }
    ]);
  }

  // Khởi tạo sản phẩm mẫu
  async initializeProducts(): Promise<void> {
    const sampleProducts = [
      { code: 'C20_XANH', name: 'C20 XANH', category: 'Dấu tròn', currentPrice: 50000 },
      { code: 'C20_DO', name: 'C20 ĐỎ', category: 'Dấu tròn', currentPrice: 50000 },
      { code: 'C30_XANH', name: 'C30 XANH', category: 'Dấu tròn', currentPrice: 70000 },
      { code: 'C30_DO', name: 'C30 ĐỎ', category: 'Dấu tròn', currentPrice: 70000 },
      { code: 'C40_XANH', name: 'C40 XANH', category: 'Dấu tròn', currentPrice: 90000 },
      { code: 'C40_DO', name: 'C40 ĐỎ', category: 'Dấu tròn', currentPrice: 90000 },
      { code: 'CAO_SU', name: 'CAO SU', category: 'Dấu cao su', currentPrice: 120000 },
      { code: 'CAN_70_120', name: 'CẦN 70*120', category: 'Phụ kiện', currentPrice: 30000 },
      { code: 'LAN_TAY_SHINY', name: 'LĂN TAY SHINY', category: 'Phụ kiện', currentPrice: 25000 },
      { code: 'MUC_LAN_TAY_DEN', name: 'MỰC LĂN TAY ĐEN', category: 'Mực', currentPrice: 15000 },
      { code: 'MUC_LAN_TAY_DO', name: 'MỰC LĂN TAY ĐỎ', category: 'Mực', currentPrice: 15000 },
      { code: 'MUC_LAN_TAY_XANH', name: 'MỰC LĂN TAY XANH', category: 'Mực', currentPrice: 15000 },
      { code: 'MUC_XANH_10ML', name: 'MỰC XANH 10ML', category: 'Mực', currentPrice: 20000 },
      { code: 'MUC_XANH_20ML', name: 'MỰC XANH 20ML', category: 'Mực', currentPrice: 35000 },
      { code: 'MUC_DO_10ML', name: 'MỰC ĐỎ 10ML', category: 'Mực', currentPrice: 20000 },
      { code: 'MUC_DO_20ML', name: 'MỰC ĐỎ 20ML', category: 'Mực', currentPrice: 35000 },
      { code: 'P30_DO', name: 'P30 ĐỎ', category: 'Dấu chữ nhật', currentPrice: 80000 },
      { code: 'P53_DATE_DO', name: 'P53 DATE ĐỎ', category: 'Dấu ngày', currentPrice: 150000 },
      { code: 'PET_300', name: 'PET 300', category: 'Phụ kiện', currentPrice: 45000 },
      { code: 'PET_400', name: 'PET 400', category: 'Phụ kiện', currentPrice: 60000 },
      { code: 'R24', name: 'R24', category: 'Dấu tròn', currentPrice: 40000 },
      { code: 'R40', name: 'R40', category: 'Dấu tròn', currentPrice: 65000 },
      { code: 'R40_DATE', name: 'R40 DATE', category: 'Dấu ngày', currentPrice: 120000 },
    ];

    for (const productData of sampleProducts) {
      const existingProduct = await this.productModel.findOne({ code: productData.code });
      if (!existingProduct) {
        const product = new this.productModel({
          ...productData,
          stockQuantity: 100,
          minStock: 10,
          avgImportPrice: productData.currentPrice * 0.7, // Giả sử giá nhập = 70% giá bán
          unit: 'cái',
          isActive: true
        });
        await product.save();
      }
    }
    console.log('✅ Đã khởi tạo danh sách sản phẩm mẫu');
  }
} 
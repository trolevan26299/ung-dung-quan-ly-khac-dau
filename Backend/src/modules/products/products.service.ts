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

    const filter: any = {};
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
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return product;
  }

  async findByCode(code: string): Promise<Product> {
    const product = await this.productModel.findOne({ code }).exec();
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
    const result = await this.productModel.findByIdAndDelete(id);
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
      $expr: { $lte: ['$stockQuantity', '$minStock'] }
    }).exec();
  }

  // Lấy sản phẩm bán chạy nhất
  async getTopSellingProducts(limit: number = 10): Promise<any[]> {
    return this.productModel.aggregate([
      { $match: {} },
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
} 
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginationQuery } from '../../types/common.types';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if category with the same name already exists
    const existingCategory = await this.categoryModel.findOne({ 
      name: { $regex: new RegExp(`^${createCategoryDto.name}$`, 'i') } 
    });
    
    if (existingCategory) {
      throw new ConflictException('Danh mục với tên này đã tồn tại');
    }

    const category = new this.categoryModel(createCategoryDto);
    return category.save();
  }

  async findAll(query: PaginationQuery) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get categories
    const [categories, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments(filter)
    ]);

    // Calculate productCount for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await this.productModel.countDocuments({ 
          category: category.name 
        });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    return {
      data: categoriesWithCount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findActive(): Promise<any[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .exec();

    // Calculate productCount for each active category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await this.productModel.countDocuments({ 
          category: category.name 
        });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    return categoriesWithCount;
  }

  async findOne(id: string): Promise<any> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // Calculate productCount for this category
    const productCount = await this.productModel.countDocuments({ 
      category: category.name 
    });

    return {
      ...category.toObject(),
      productCount
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<any> {
    // Check if category with the same name already exists (excluding current category)
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryModel.findOne({ 
        name: { $regex: new RegExp(`^${updateCategoryDto.name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        throw new ConflictException('Danh mục với tên này đã tồn tại');
      }
    }

    // Get old category name before update
    const oldCategory = await this.categoryModel.findById(id);
    if (!oldCategory) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    const category = await this.categoryModel.findByIdAndUpdate(
      id, 
      updateCategoryDto, 
      { new: true, runValidators: true }
    );

    // Update product categories if name changed
    if (updateCategoryDto.name && updateCategoryDto.name !== oldCategory.name) {
      await this.productModel.updateMany(
        { category: oldCategory.name },
        { category: updateCategoryDto.name }
      );
    }

    // Calculate productCount for updated category
    const productCount = await this.productModel.countDocuments({ 
      category: category.name 
    });

    return {
      ...category.toObject(),
      productCount
    };
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // Check if category has products
    const productCount = await this.productModel.countDocuments({ 
      category: category.name 
    });

    if (productCount > 0) {
      throw new ConflictException(`Không thể xóa danh mục "${category.name}" vì còn ${productCount} sản phẩm đang sử dụng`);
    }

    await this.categoryModel.findByIdAndDelete(id);
  }
} 
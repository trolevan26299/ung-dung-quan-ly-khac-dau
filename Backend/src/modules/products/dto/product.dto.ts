import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Mã sản phẩm (VD: C20 XANH, C20 ĐỎ)' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Tên sản phẩm' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Số lượng tồn kho', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiProperty({ description: 'Giá nhập trung bình', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  avgImportPrice?: number;

  @ApiProperty({ description: 'Giá bán hiện tại', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentPrice?: number;

  @ApiProperty({ description: 'Loại sản phẩm', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Màu sắc', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Kích thước', required: false })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ description: 'Đơn vị tính', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'Tồn kho tối thiểu', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'URL hình ảnh', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateProductDto {
  @ApiProperty({ description: 'Tên sản phẩm', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Số lượng tồn kho', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiProperty({ description: 'Giá nhập trung bình', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  avgImportPrice?: number;

  @ApiProperty({ description: 'Giá bán hiện tại', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentPrice?: number;

  @ApiProperty({ description: 'Loại sản phẩm', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Màu sắc', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Kích thước', required: false })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ description: 'Đơn vị tính', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'Tồn kho tối thiểu', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'URL hình ảnh', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class ImportProductDto {
  @ApiProperty({ description: 'Mã sản phẩm' })
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiProperty({ description: 'Số lượng nhập' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Giá nhập' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  importPrice: number;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
} 
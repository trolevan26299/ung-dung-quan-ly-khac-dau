import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsMongoId, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionType } from '../../../types/common.types';

export class CreateStockTransactionDto {
  @ApiProperty({ description: 'ID sản phẩm' })  
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'Loại giao dịch', enum: TransactionType })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({ description: 'Số lượng' })
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Giá đơn vị', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiProperty({ description: 'Lý do giao dịch', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ImportStockDto {
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
  unitPrice: number;

  @ApiProperty({ description: 'Lý do nhập hàng', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AdjustStockDto {
  @ApiProperty({ description: 'Mã sản phẩm' })
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiProperty({ description: 'Số lượng điều chỉnh (có thể âm)' })
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Lý do điều chỉnh' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class StockReportQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  search?: string;

  @ApiProperty({ enum: TransactionType, required: false })
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @ApiProperty({ required: false, description: 'Từ ngày (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'Đến ngày (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  endDate?: string;
} 
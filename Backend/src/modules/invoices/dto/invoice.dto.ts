import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Mã đơn hàng' })
  @IsString()
  @IsNotEmpty()
  orderCode: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class InvoiceQueryDto {
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

  @ApiProperty({ required: false, enum: ['pending', 'completed', 'debt'] })
  @IsOptional()
  paymentStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPrinted?: boolean;

  @ApiProperty({ required: false, description: 'Từ ngày (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'Đến ngày (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class PrintInvoiceDto {
  @ApiProperty({ description: 'ID hóa đơn' })
  @IsMongoId()
  invoiceId: string;
} 
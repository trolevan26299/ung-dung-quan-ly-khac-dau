import { IsOptional, IsEnum, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class StatisticsQueryDto {
  @ApiProperty({ required: false, enum: ['day', 'week', 'month', 'quarter', 'year'] })
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'quarter', 'year'])
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';

  @ApiProperty({ required: false, description: 'Từ ngày (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'Đến ngày (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ required: false, description: 'Số lượng kết quả' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class RevenueQueryDto {
  @ApiProperty({ required: false, enum: ['month', 'quarter', 'year'] })
  @IsOptional()
  @IsEnum(['month', 'quarter', 'year'])
  period?: 'month' | 'quarter' | 'year';

  @ApiProperty({ required: false, description: 'Năm cần thống kê' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;
} 
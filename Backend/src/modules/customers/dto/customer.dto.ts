import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsMongoId, IsNumberString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CustomerQueryDto {
  @ApiProperty({ description: 'Số trang', required: false, default: 1 })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({ description: 'Số lượng mỗi trang', required: false, default: 10 })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiProperty({ description: 'Từ khóa tìm kiếm', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateCustomerDto {
  @ApiProperty({ description: 'Tên khách hàng' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Địa chỉ', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Mã số thuế', required: false })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'ID đại lý phụ trách' })
  @IsNotEmpty()
  @IsMongoId()
  agentId: string;

  @ApiProperty({ description: 'Tên đại lý phụ trách' })
  @IsNotEmpty()
  @IsString()
  agentName: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCustomerDto {
  @ApiProperty({ description: 'Tên khách hàng', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Địa chỉ', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Mã số thuế', required: false })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'ID đại lý phụ trách', required: false })
  @IsOptional()
  @IsMongoId()
  agentId?: string;

  @ApiProperty({ description: 'Tên đại lý phụ trách', required: false })
  @IsOptional()
  @IsString()
  agentName?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
} 
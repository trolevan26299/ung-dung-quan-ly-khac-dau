import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, IsMongoId, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PaymentStatus, OrderStatus } from '../../../types/common.types';

export class OrderItemDto {
  @ApiProperty({ description: 'ID sản phẩm' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'Số lượng' })
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Giá đơn vị' })
  @Type(() => Number)
  @IsNumber()
  unitPrice: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'ID khách hàng', required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsMongoId()
  customerId?: string;

  @ApiProperty({ description: 'ID đại lý', required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsMongoId()
  agentId?: string;

  @ApiProperty({ description: 'Danh sách sản phẩm', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: 'Trạng thái thanh toán', enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Phương thức thanh toán', enum: ['company_account', 'personal_account', 'cash'], required: false })
  @IsOptional()
  @IsEnum(['company_account', 'personal_account', 'cash'])
  paymentMethod?: string;

  @ApiProperty({ description: 'VAT', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vat?: number;

  @ApiProperty({ description: 'Phí vận chuyển', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shippingFee?: number;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Tên khách hàng (nếu không có ID)', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ description: 'Số điện thoại khách hàng', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ description: 'Tên đại lý (nếu không có ID)', required: false })
  @IsOptional()
  @IsString()
  agentName?: string;
}

export class UpdateOrderDto {
  @ApiProperty({ description: 'Danh sách sản phẩm', type: [OrderItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @ApiProperty({ description: 'Trạng thái thanh toán', enum: PaymentStatus, required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({ description: 'Phương thức thanh toán', enum: ['company_account', 'personal_account', 'cash'], required: false })
  @IsOptional()
  @IsEnum(['company_account', 'personal_account', 'cash'])
  paymentMethod?: string;

  @ApiProperty({ description: 'VAT', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vat?: number;

  @ApiProperty({ description: 'Phí vận chuyển', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shippingFee?: number;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Trạng thái đơn hàng', enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class OrderQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: PaymentStatus, required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({ enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsMongoId()
  customerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsMongoId()
  agentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateTo?: string;
} 
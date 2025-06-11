import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Tên danh mục' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Mô tả danh mục', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Tên danh mục', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Mô tả danh mục', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class ClientLoginDto {
  @ApiProperty({ description: 'Tên đăng nhập' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: 'Mật khẩu' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}

export class CreateClientAccountDto {
  @ApiProperty({ description: 'Tên đăng nhập (chữ thường, số, dấu . _ -)' })
  @IsString()
  @Matches(/^[a-zA-Z0-9._-]{3,50}$/, { message: 'Tên đăng nhập 3-50 ký tự, chỉ gồm chữ, số, . _ -' })
  username: string;

  @ApiProperty({ description: 'Mật khẩu' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  @MaxLength(100)
  password: string;

  @ApiProperty({ description: 'Tên đại lý / người dùng' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên đại lý' })
  @MaxLength(150)
  displayName: string;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ description: 'Đang hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateClientAccountDto extends PartialType(CreateClientAccountDto) {}

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { USER_ROLES } from '../../constants';
import { ClientJwtGuard } from './client-jwt';
import { ClientPortalService } from './client-portal.service';
import { ClientLoginDto, CreateClientAccountDto, UpdateClientAccountDto } from './dto/client-account.dto';

const getClientIp = (req: any): string => {
  const cf = req.headers?.['cf-connecting-ip'];
  const xff = req.headers?.['x-forwarded-for'];
  return String(cf || (xff ? String(xff).split(',')[0] : '') || req.ip || 'unknown').trim();
};

// API cho web đại lý (khacdau-client): dùng token đại lý riêng
@ApiTags('Client Portal')
@Controller('client-portal')
export class ClientPortalController {
  constructor(private readonly service: ClientPortalService) {}

  @Post('auth/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đại lý đăng nhập' })
  login(@Body() dto: ClientLoginDto, @Request() req) {
    return this.service.login(dto, getClientIp(req));
  }

  @Get('me')
  @UseGuards(ClientJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thông tin tài khoản đại lý đang đăng nhập' })
  me(@Request() req) {
    return this.service.me(req.user.accountId);
  }

  @Get('company-lookup/:taxCode')
  @UseGuards(ClientJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đại lý tra cứu doanh nghiệp theo MST' })
  lookup(@Param('taxCode') taxCode: string, @Request() req) {
    return this.service.lookup(req.user.accountId, taxCode);
  }
}

// API cho admin web nội bộ quản lý tài khoản đại lý
@ApiTags('Client Accounts')
@Controller('client-accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientAccountsController {
  constructor(private readonly service: ClientPortalService) {}

  private requireAdmin(req: any) {
    if (req.user?.role !== USER_ROLES.ADMIN) throw new ForbiddenException('Cần quyền quản trị viên');
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách tài khoản đại lý (admin)' })
  findAll(@Request() req) {
    this.requireAdmin(req);
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Tạo tài khoản đại lý (admin)' })
  create(@Body() dto: CreateClientAccountDto, @Request() req) {
    this.requireAdmin(req);
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật / đổi mật khẩu / khóa tài khoản đại lý (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateClientAccountDto, @Request() req) {
    this.requireAdmin(req);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tài khoản đại lý (admin)' })
  remove(@Param('id') id: string, @Request() req) {
    this.requireAdmin(req);
    return this.service.remove(id);
  }
}

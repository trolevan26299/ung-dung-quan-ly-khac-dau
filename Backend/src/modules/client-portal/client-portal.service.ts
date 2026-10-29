import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { ClientAccount, ClientAccountDocument } from '../../schemas/client-account.schema';
import { CompanyLookupService } from '../company-lookup/company-lookup.service';
import { CLIENT_TOKEN_TYPE } from './client-jwt';
import { ClientLoginDto, CreateClientAccountDto, UpdateClientAccountDto } from './dto/client-account.dto';
import { RateLimiter } from './rate-limiter';

const MINUTE = 60 * 1000;
// Hash giả để so sánh khi không có tài khoản, tránh lộ username tồn tại qua thời gian phản hồi
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 10);

@Injectable()
export class ClientPortalService {
  // Sai mật khẩu: tối đa 5 lần / 15 phút cho mỗi (IP + username), 30 lần / 15 phút cho mỗi IP
  private loginFailByUser = new RateLimiter(5, 15 * MINUTE);
  private loginFailByIp = new RateLimiter(30, 15 * MINUTE);
  // Tra cứu: tối đa 200 MST / giờ cho mỗi tài khoản
  private lookupLimit = new RateLimiter(200, 60 * MINUTE);

  constructor(
    @InjectModel(ClientAccount.name) private clientAccountModel: Model<ClientAccountDocument>,
    private jwtService: JwtService,
    private companyLookupService: CompanyLookupService,
  ) {}

  private toPublic(account: any) {
    return {
      id: String(account._id),
      username: account.username,
      displayName: account.displayName,
      phone: account.phone || '',
      address: account.address || '',
    };
  }

  private toAdmin(account: any) {
    return {
      ...this.toPublic(account),
      notes: account.notes || '',
      isActive: account.isActive,
      lastLoginAt: account.lastLoginAt,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  // ===== Đại lý đăng nhập =====

  async login(dto: ClientLoginDto, ip: string) {
    const username = (dto.username || '').trim().toLowerCase();
    const userKey = `${ip}|${username}`;
    if (this.loginFailByUser.isBlocked(userKey) || this.loginFailByIp.isBlocked(ip)) {
      throw new HttpException('Đăng nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút', HttpStatus.TOO_MANY_REQUESTS);
    }

    const account = await this.clientAccountModel.findOne({ username });
    const ok = await bcrypt.compare(dto.password, account?.password || DUMMY_HASH);
    if (!account || !ok || !account.isActive) {
      this.loginFailByUser.hit(userKey);
      this.loginFailByIp.hit(ip);
      throw new UnauthorizedException(
        account && ok && !account.isActive ? 'Tài khoản đã bị khóa' : 'Tên đăng nhập hoặc mật khẩu không đúng',
      );
    }

    this.loginFailByUser.reset(userKey);
    account.lastLoginAt = new Date();
    await account.save();

    return {
      access_token: this.jwtService.sign({ sub: String(account._id), username: account.username, typ: CLIENT_TOKEN_TYPE }),
      account: this.toPublic(account),
    };
  }

  async me(accountId: string) {
    const account = await this.clientAccountModel.findById(accountId).lean();
    if (!account) throw new NotFoundException('Không tìm thấy tài khoản');
    return this.toPublic(account);
  }

  async lookup(accountId: string, taxCode: string) {
    if (this.lookupLimit.isBlocked(accountId)) {
      throw new HttpException('Bạn đã tra cứu quá nhiều trong 1 giờ, vui lòng thử lại sau', HttpStatus.TOO_MANY_REQUESTS);
    }
    this.lookupLimit.hit(accountId);
    return this.companyLookupService.lookup(taxCode);
  }

  // ===== Admin quản lý tài khoản đại lý =====

  async findAll() {
    const accounts = await this.clientAccountModel.find().sort({ createdAt: -1 }).lean();
    return accounts.map(a => this.toAdmin(a));
  }

  async create(dto: CreateClientAccountDto) {
    const username = dto.username.trim().toLowerCase();
    if (await this.clientAccountModel.exists({ username })) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }
    const account = await this.clientAccountModel.create({
      username,
      password: await bcrypt.hash(dto.password, 10),
      displayName: dto.displayName,
      phone: dto.phone,
      address: dto.address,
      notes: dto.notes,
      isActive: dto.isActive ?? true,
    });
    return this.toAdmin(account.toObject());
  }

  async update(id: string, dto: UpdateClientAccountDto) {
    const account = await this.clientAccountModel.findById(id);
    if (!account) throw new NotFoundException('Không tìm thấy tài khoản');

    if (dto.username !== undefined) {
      const username = dto.username.trim().toLowerCase();
      if (username !== account.username && (await this.clientAccountModel.exists({ username }))) {
        throw new ConflictException('Tên đăng nhập đã tồn tại');
      }
      account.username = username;
    }
    if (dto.password) account.password = await bcrypt.hash(dto.password, 10);
    if (dto.displayName !== undefined) account.displayName = dto.displayName;
    if (dto.phone !== undefined) account.phone = dto.phone;
    if (dto.address !== undefined) account.address = dto.address;
    if (dto.notes !== undefined) account.notes = dto.notes;
    if (dto.isActive !== undefined) account.isActive = dto.isActive;

    await account.save();
    return this.toAdmin(account.toObject());
  }

  async remove(id: string) {
    const result = await this.clientAccountModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Không tìm thấy tài khoản');
    return { success: true };
  }
}

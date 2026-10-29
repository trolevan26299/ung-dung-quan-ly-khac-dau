import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClientAccount, ClientAccountDocument } from '../../schemas/client-account.schema';

export const CLIENT_TOKEN_TYPE = 'client';

// Khóa ký token đại lý KHÁC khóa nội bộ, để token đại lý không dùng được cho API nội bộ
// (JwtStrategy nội bộ chỉ kiểm tra chữ ký, không tra lại DB).
export const getClientJwtSecret = (config: ConfigService) =>
  config.get<string>('CLIENT_JWT_SECRET') || `${config.get<string>('JWT_SECRET')}::client-portal`;

export interface ClientUser {
  accountId: string;
  username: string;
}

@Injectable()
export class ClientJwtStrategy extends PassportStrategy(Strategy, 'client-jwt') {
  constructor(
    config: ConfigService,
    @InjectModel(ClientAccount.name) private clientAccountModel: Model<ClientAccountDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getClientJwtSecret(config),
    });
  }

  async validate(payload: any): Promise<ClientUser> {
    if (payload?.typ !== CLIENT_TOKEN_TYPE) throw new UnauthorizedException();
    // Tra lại DB để tài khoản bị khóa/xóa mất quyền ngay, không phải chờ token hết hạn
    const account = await this.clientAccountModel.findById(payload.sub).select('username isActive').lean();
    if (!account || !account.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không tồn tại');
    }
    return { accountId: String(account._id), username: account.username };
  }
}

@Injectable()
export class ClientJwtGuard extends AuthGuard('client-jwt') {}

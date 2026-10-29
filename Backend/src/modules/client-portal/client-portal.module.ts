import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ClientAccount, ClientAccountSchema } from '../../schemas/client-account.schema';
import { CompanyLookupModule } from '../company-lookup/company-lookup.module';
import { ClientJwtStrategy, getClientJwtSecret } from './client-jwt';
import { ClientAccountsController, ClientPortalController } from './client-portal.controller';
import { ClientPortalService } from './client-portal.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ClientAccount.name, schema: ClientAccountSchema }]),
    PassportModule,
    // JwtService riêng của module này, ký bằng khóa đại lý
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: getClientJwtSecret(config),
        signOptions: { expiresIn: config.get<string>('CLIENT_JWT_EXPIRES_IN') || '7d' },
      }),
      inject: [ConfigService],
    }),
    CompanyLookupModule,
  ],
  controllers: [ClientPortalController, ClientAccountsController],
  providers: [ClientPortalService, ClientJwtStrategy],
})
export class ClientPortalModule {}

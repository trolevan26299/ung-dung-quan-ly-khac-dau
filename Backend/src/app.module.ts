import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { AgentsModule } from './modules/agents/agents.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { StockModule } from './modules/stock/stock.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { InvoicesModule } from './modules/invoices/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/khac_dau_db'),
    AuthModule,
    UsersModule,
    CustomersModule,
    AgentsModule,
    ProductsModule,
    OrdersModule,
    StockModule,
    StatisticsModule,
    InvoicesModule,
  ],
})
export class AppModule {} 
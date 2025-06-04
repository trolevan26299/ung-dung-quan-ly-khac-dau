import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Customer, CustomerSchema } from '../../schemas/customer.schema';
import { Agent, AgentSchema } from '../../schemas/agent.schema';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
    StockModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {} 
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { Customer, CustomerSchema } from '../../schemas/customer.schema';
import { Agent, AgentSchema } from '../../schemas/agent.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {} 
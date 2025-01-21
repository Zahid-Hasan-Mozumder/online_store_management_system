import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { RouteModule } from 'src/route/route.module';

@Module({
  imports : [RouteModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}

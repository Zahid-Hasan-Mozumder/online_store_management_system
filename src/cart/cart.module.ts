import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { RouteModule } from 'src/route/route.module';
import { HttpModule } from '@nestjs/axios';
import { RouteService } from 'src/route/route.service';

@Module({
  imports : [RouteModule],
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule {}

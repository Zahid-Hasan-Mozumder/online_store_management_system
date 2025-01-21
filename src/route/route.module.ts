import { Module } from '@nestjs/common';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  controllers: [RouteController],
  providers: [RouteService],
  exports: [RouteService]
})
export class RouteModule {}

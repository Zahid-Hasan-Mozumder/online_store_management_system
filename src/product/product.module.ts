import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [ProductController],
  providers: [ProductService]
})
export class ProductModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { ProductModule } from './product/product.module';
import { MulterModule } from '@nestjs/platform-express';
import { VarientModule } from './varient/varient.module';
import { CollectionModule } from './collection/collection.module';
import { TagModule } from './tag/tag.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MulterModule.register(),
    AuthModule,
    PrismaModule, AdminModule, ProductModule, VarientModule, CollectionModule, TagModule, CartModule
  ]
})
export class AppModule { }

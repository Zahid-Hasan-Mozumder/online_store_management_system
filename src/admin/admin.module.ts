import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Reflector } from '@nestjs/core';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService]
})
export class AdminModule {}

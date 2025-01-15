import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist : true }))
  await app.listen(process.env.PORT ?? 3000);

  const prismaClient = new PrismaClient();
  
  await prismaClient.productCounts.upsert({
    where : {
      id : 1
    },
    update : {},
    create : {
      id : 1,
      count : 0
    }
  })

  await prismaClient.collectionCounts.upsert({
    where : {
      id : 1
    },
    update : {},
    create : {
      id : 1,
      count : 0
    }
  })

  await prismaClient.tagCounts.upsert({
    where : {
      id : 1
    },
    update : {},
    create : {
      id : 1,
      count : 0
    }
  })
}
bootstrap();

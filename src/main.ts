import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist : true }))

  const config = new DocumentBuilder()
  .setTitle('API Documentation')
  .setDescription('REST API for online bookmark system')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);
  
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

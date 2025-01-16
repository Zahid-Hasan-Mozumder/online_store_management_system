import { Module } from '@nestjs/common';
import { VarientController } from './varient.controller';
import { VarientService } from './varient.service';

@Module({
  controllers: [VarientController],
  providers: [VarientService]
})
export class VarientModule {}

import { Module } from '@nestjs/common';
import { PaywayService } from './payway.service';
import { PaywayController } from './payway.controller';

@Module({
  controllers: [PaywayController],
  providers: [PaywayService],
  exports: [PaywayService],
})
export class PaywayModule {}

import { Module } from '@nestjs/common';
import { MetaConversionsService } from './meta-conversions.service';
import { MetaConversionsController } from './meta-conversions.controller';

@Module({
  providers: [MetaConversionsService],
  controllers: [MetaConversionsController]
})
export class MetaConversionsModule {}

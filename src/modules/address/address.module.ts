import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from '../../schemas/address.schema';

@Module({
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Address.name,
        schema: AddressSchema,
      },
    ]),
  ],
})
export class AddressModule {}

import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { paymentProviders } from './providers';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, ...paymentProviders],
  exports: [PaymentsService],
})
export class PaymentsModule {}

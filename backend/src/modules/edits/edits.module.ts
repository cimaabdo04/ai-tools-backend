import { Module } from '@nestjs/common';
import { EditsController } from './edits.controller';
import { EditsService } from './edits.service';

@Module({
  controllers: [EditsController],
  providers: [EditsService],
  exports: [EditsService],
})
export class EditsModule {}

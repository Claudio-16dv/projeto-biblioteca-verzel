import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoansRepository } from './loans.repository';

@Module({
  controllers: [LoansController],
  providers: [LoansService, LoansRepository],
  exports: [LoansRepository],
})
export class LoansModule {}

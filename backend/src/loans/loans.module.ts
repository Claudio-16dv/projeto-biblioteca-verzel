import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoansRepository } from './loans.repository';
import { ExportService } from './export.service';

@Module({
  controllers: [LoansController],
  providers: [LoansService, LoansRepository, ExportService],
  exports: [LoansRepository],
})
export class LoansModule {}

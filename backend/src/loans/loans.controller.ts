import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { ExportService } from './export.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanFilterDto } from './dto/loan-filter.dto';

@Controller('loans')
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
    private readonly exportService: ExportService,
  ) {}

  @Post()
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  // BIBL-5: rota estática declarada antes das demais GET.
  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="emprestimos.csv"')
  exportCsv(@Query() filter: LoanFilterDto) {
    return this.exportService.toCsv(filter);
  }

  // BIBL-4: relatório com filtros opcionais (userId, from, to, status).
  @Get()
  findAll(@Query() filter: LoanFilterDto) {
    return this.loansService.findAll(filter);
  }

  @Patch(':id/return')
  returnLoan(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.returnLoan(id);
  }
}

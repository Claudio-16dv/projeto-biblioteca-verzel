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
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../common/dto/api-error.dto';
import { LoansService } from './loans.service';
import { ExportService } from './export.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanFilterDto } from './dto/loan-filter.dto';
import { LoanResponseDto } from './dto/loan-response.dto';

@ApiTags('empréstimos')
@Controller('loans')
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
    private readonly exportService: ExportService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registra um empréstimo e baixa uma cópia do livro' })
  @ApiCreatedResponse({ type: LoanResponseDto })
  @ApiConflictResponse({
    description:
      'Livro sem cópias disponíveis ou leitor no limite de 3 empréstimos ativos',
    type: ApiErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Livro ou leitor inexistente',
    type: ApiErrorDto,
  })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  // BIBL-5: rota estática declarada antes das demais GET.
  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="emprestimos.csv"')
  @ApiOperation({
    summary: 'Exporta o relatório em CSV',
    description:
      'Aceita os mesmos filtros do relatório e reflete exatamente o mesmo conjunto. ' +
      'Sem resultados, o arquivo sai apenas com a linha de cabeçalho.',
  })
  @ApiProduces('text/csv')
  @ApiOkResponse({
    description: 'Arquivo CSV com uma linha por empréstimo',
    content: { 'text/csv': { schema: { type: 'string' } } },
  })
  exportCsv(@Query() filter: LoanFilterDto) {
    return this.exportService.toCsv(filter);
  }

  // BIBL-4: relatório com filtros opcionais (userId, from, to, status).
  @Get()
  @ApiOperation({
    summary: 'Relatório de empréstimos',
    description:
      'Os filtros são opcionais e combinam entre si. Sem nenhum filtro, devolve tudo.',
  })
  @ApiOkResponse({ type: [LoanResponseDto] })
  findAll(@Query() filter: LoanFilterDto) {
    return this.loansService.findAll(filter);
  }

  @Patch(':id/return')
  @ApiOperation({ summary: 'Encerra o empréstimo e devolve a cópia ao acervo' })
  @ApiOkResponse({ type: LoanResponseDto })
  @ApiConflictResponse({ description: 'Empréstimo já devolvido', type: ApiErrorDto })
  @ApiNotFoundResponse({ description: 'Empréstimo inexistente', type: ApiErrorDto })
  returnLoan(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.returnLoan(id);
  }
}

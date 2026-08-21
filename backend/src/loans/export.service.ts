import { Injectable } from '@nestjs/common';
import { LoansRepository } from './loans.repository';
import { LoanFilterDto } from './dto/loan-filter.dto';
import { toLoanResponse } from './loans.mapper';

const HEADER = 'livro,usuario,data,situacao';

/**
 * BIBL-5: gera o CSV do relatório reusando exatamente o mesmo conjunto filtrado
 * do BIBL-4. Sem resultados, retorna apenas o cabeçalho.
 */
@Injectable()
export class ExportService {
  constructor(private readonly loansRepository: LoansRepository) {}

  async toCsv(filter: LoanFilterDto = {}): Promise<string> {
    const loans = await this.loansRepository.findWithFilters(filter);

    const rows = loans.map((loan) => {
      const view = toLoanResponse(loan);
      const data = view.loanedAt.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
      return [view.book.title, view.user.name, data, view.status]
        .map(escapeCsv)
        .join(',');
    });

    return [HEADER, ...rows].join('\n');
  }
}

/** Escapa campo com vírgula, aspas ou quebra de linha (aspas internas duplicadas). */
function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

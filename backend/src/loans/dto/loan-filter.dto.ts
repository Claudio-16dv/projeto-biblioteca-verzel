import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional } from 'class-validator';

/**
 * Filtros opcionais do relatório (BIBL-4) e da exportação CSV (BIBL-5).
 * Chegam como query params (sempre string); `userId` é convertido para número.
 */
export class LoanFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Identificador do leitor deve ser um número inteiro.' })
  userId?: number;

  // Datas no formato YYYY-MM-DD.
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Data inicial deve estar no formato AAAA-MM-DD.' },
  )
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data final deve estar no formato AAAA-MM-DD.' })
  to?: string;

  @IsOptional()
  @IsIn(['ativo', 'devolvido'], {
    message: 'Situação deve ser "ativo" ou "devolvido".',
  })
  status?: 'ativo' | 'devolvido';
}

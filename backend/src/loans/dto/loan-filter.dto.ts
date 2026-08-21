import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional } from 'class-validator';

/**
 * Filtros opcionais do relatório (BIBL-4) e da exportação CSV (BIBL-5).
 * Chegam como query params (sempre string); `userId` é convertido para número.
 */
export class LoanFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  // Datas no formato YYYY-MM-DD.
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsIn(['ativo', 'devolvido'])
  status?: 'ativo' | 'devolvido';
}

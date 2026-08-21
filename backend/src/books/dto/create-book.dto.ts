import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { IsNotFutureYear } from '../../common/validators/is-not-future-year.validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

/**
 * As mensagens sao escritas para leitura humana porque o frontend renderiza
 * `message` direto na tela (criterios de aceite do BIBL-1).
 */
export class CreateBookDto {
  @Transform(trim)
  @IsString({ message: 'Titulo deve ser um texto.' })
  @IsNotEmpty({ message: 'Titulo e obrigatorio.' })
  title: string;

  @Transform(trim)
  @IsString({ message: 'Autor deve ser um texto.' })
  @IsNotEmpty({ message: 'Autor e obrigatorio.' })
  author: string;

  @IsInt({ message: 'Ano de publicacao deve ser um numero inteiro.' })
  @IsNotFutureYear({ message: 'Ano de publicacao nao pode estar no futuro.' })
  publicationYear: number;

  // Zero e valido: o criterio de aceite recusa apenas quantidade negativa.
  @IsInt({ message: 'Quantidade de copias deve ser um numero inteiro.' })
  @Min(0, { message: 'Quantidade de copias nao pode ser negativa.' })
  copies: number;
}

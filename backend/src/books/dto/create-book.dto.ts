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
  @IsString({ message: 'Título deve ser um texto.' })
  @IsNotEmpty({ message: 'Título é obrigatório.' })
  title: string;

  @Transform(trim)
  @IsString({ message: 'Autor deve ser um texto.' })
  @IsNotEmpty({ message: 'Autor é obrigatório.' })
  author: string;

  @IsInt({ message: 'Ano de publicação deve ser um número inteiro.' })
  @IsNotFutureYear({ message: 'Ano de publicação não pode estar no futuro.' })
  publicationYear: number;

  // Zero e valido: o criterio de aceite recusa apenas quantidade negativa.
  @IsInt({ message: 'Quantidade de cópias deve ser um número inteiro.' })
  @Min(0, { message: 'Quantidade de cópias não pode ser negativa.' })
  copies: number;
}

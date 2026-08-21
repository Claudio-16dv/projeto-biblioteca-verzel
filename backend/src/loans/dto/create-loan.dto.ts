import { IsInt } from 'class-validator';

/**
 * As mensagens sao escritas para leitura humana porque o frontend renderiza
 * `message` direto na tela.
 */
export class CreateLoanDto {
  @IsInt({ message: 'Identificador do livro deve ser um número inteiro.' })
  bookId: number;

  @IsInt({ message: 'Identificador do leitor deve ser um número inteiro.' })
  userId: number;
}

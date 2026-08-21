import { ApiProperty } from '@nestjs/swagger';
import { BookResponseDto } from '../../books/dto/book-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

/** Emprestimo com o livro e o leitor ja resolvidos. */
export class LoanResponseDto {
  id: number;

  book: BookResponseDto;

  user: UserResponseDto;

  loanedAt: Date;

  /** Nulo enquanto o emprestimo estiver ativo. */
  returnedAt: Date | null;

  /** Derivado de returnedAt; nao existe como coluna. */
  @ApiProperty({ enum: ['ativo', 'devolvido'] })
  status: 'ativo' | 'devolvido';
}

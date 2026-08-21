/** Livro do acervo. */
export class BookResponseDto {
  id: number;

  title: string;

  author: string;

  publicationYear: number;

  /** Tamanho do acervo. Nao muda apos o cadastro. */
  totalCopies: number;

  /** Copias em prateleira. Cai a cada emprestimo e volta a cada devolucao. */
  availableCopies: number;

  createdAt: Date;
}

/** Item do ranking de livros mais emprestados. */
export class RankedBookDto {
  id: number;

  title: string;

  author: string;

  /** Total de vezes que o livro foi emprestado, contando os ja devolvidos. */
  totalLoans: number;
}

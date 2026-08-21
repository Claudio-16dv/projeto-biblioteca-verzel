// Retorno da API para um livro
export type Book = {
  id: number;
  title: string;
  author: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
};

export type CreateBookDto = {
  title: string;
  author: string;
  publicationYear: number;
  copies: number;
};

export type RankedBook = {
  id: number;
  title: string;
  author: string;
  totalLoans: number;
};

"use client";

import type { Book } from "@/types/book";
import { BookRow } from "./BookRow";

type BookListProps = {
  books: Book[];
  canLoan: boolean;
  loaningBookId: number | null;
  onLoan: (bookId: number) => void;
};

export function BookList({
  books,
  canLoan,
  loaningBookId,
  onLoan,
}: BookListProps) {
  return (
    <table className="w-full text-left text-sm">
      <caption className="sr-only">Livros cadastrados no acervo</caption>
      <thead>
        <tr className="border-b">
          <th scope="col" className="p-3 font-medium">
            Título
          </th>
          <th scope="col" className="p-3 font-medium">
            Autor
          </th>
          <th scope="col" className="p-3 font-medium">
            Ano
          </th>
          <th scope="col" className="p-3 font-medium">
            Disponíveis
          </th>
          <th scope="col" className="p-3 font-medium">
            Ações
          </th>
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <BookRow
            key={book.id}
            book={book}
            canLoan={canLoan}
            isLoaning={loaningBookId === book.id}
            onLoan={onLoan}
          />
        ))}
      </tbody>
    </table>
  );
}

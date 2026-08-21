"use client";

import type { Book } from "@/types/book";
import { Button } from "@/components/ui/button";

type BookRowProps = {
  book: Book;
  canLoan: boolean;
  isLoaning: boolean;
  onLoan: (bookId: number) => void;
};

export function BookRow({ book, canLoan, isLoaning, onLoan }: BookRowProps) {
  const isUnavailable = book.availableCopies === 0;

  return (
    <tr className="border-b">
      <td className="p-3">{book.title}</td>
      <td className="p-3">{book.author}</td>
      <td className="p-3">{book.publicationYear}</td>
      <td className="p-3">
        {isUnavailable
          ? "Sem cópias"
          : `${book.availableCopies} de ${book.totalCopies}`}
      </td>
      <td className="p-3">
        <Button
          onClick={() => onLoan(book.id)}
          disabled={isUnavailable || !canLoan || isLoaning}
          size="sm"
        >
          {isLoaning ? "Emprestando..." : "Emprestar"}
        </Button>
      </td>
    </tr>
  );
}

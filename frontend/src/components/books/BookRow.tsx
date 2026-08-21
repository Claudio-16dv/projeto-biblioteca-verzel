import type { Book } from "@/types/book";

type BookRowProps = {
  book: Book;
};

export function BookRow({ book }: BookRowProps) {
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
    </tr>
  );
}

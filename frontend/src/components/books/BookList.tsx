import type { Book } from "@/types/book";
import { BookRow } from "./BookRow";

type BookListProps = {
  books: Book[];
};

export function BookList({ books }: BookListProps) {
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
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <BookRow key={book.id} book={book} />
        ))}
      </tbody>
    </table>
  );
}

"use client";

import { useBooks } from "@/hooks/use-books";
import { BookList } from "@/components/books/BookList";

export default function HomePage() {
  const { books, isLoading, error } = useBooks();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-medium">Acervo</h1>

      {isLoading && <p>Carregando...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && books.length === 0 && (
        <p>Nenhum livro cadastrado</p>
      )}
      {!isLoading && !error && books.length > 0 && <BookList books={books} />}
    </main>
  );
}

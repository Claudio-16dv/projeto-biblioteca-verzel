"use client";

import { useBooks } from "@/hooks/use-books";
import { BookList } from "@/components/books/BookList";
import { BookForm } from "@/components/books/BookForm";

export default function HomePage() {
  const { books, isLoading, error, refetch } = useBooks();

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <section>
        <h1 className="mb-6 text-2xl font-medium">Acervo</h1>

        {isLoading && <p>Carregando...</p>}
        {error && <p role="alert">{error}</p>}
        {!isLoading && !error && books.length === 0 && (
          <p>Nenhum livro cadastrado</p>
        )}
        {!isLoading && !error && books.length > 0 && <BookList books={books} />}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-medium">Cadastrar livro</h2>
        <BookForm onCreated={refetch} />
      </section>
    </main>
  );
}

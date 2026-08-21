"use client";

import { useCallback, useState } from "react";
import type { Book } from "@/types/book";
import { listBooks } from "@/services/book.service";
import { MOCK_BOOKS } from "@/data/mock-books";

export function useBooks() {
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setBooks(await listBooks());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar o acervo",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { books, isLoading, error, refetch };
}

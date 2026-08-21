"use client";

import { useCallback, useState } from "react";
import type { Book } from "@/types/book";
import { listBooks } from "@/services/book.service";

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const data = await listBooks();
      setBooks(data);
      setError(null);
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

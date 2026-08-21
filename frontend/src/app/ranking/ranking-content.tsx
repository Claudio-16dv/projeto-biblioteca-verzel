"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Library,
  LoaderCircle,
  Medal,
  RefreshCw,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FeedbackMessage } from "@/components/ui/feedback-message";

type RankedBook = {
  author: string;
  id: number;
  title: string;
  totalLoans: number;
};

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

const positionStyles = [
  "text-[#7f9f00]",
  "text-secondary",
  "text-accent-foreground",
];

function isRankedBook(value: unknown): value is RankedBook {
  if (!value || typeof value !== "object") {
    return false;
  }

  const book = value as Record<string, unknown>;

  return (
    typeof book.id === "number" &&
    typeof book.title === "string" &&
    typeof book.author === "string" &&
    typeof book.totalLoans === "number"
  );
}

function RankingContent() {
  const [books, setBooks] = useState<RankedBook[]>([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRanking = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(`${apiUrl}/books/ranking`, {
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      throw new Error(`A API respondeu com status ${response.status}`);
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data) || !data.every(isRankedBook)) {
      throw new Error("A API retornou um ranking em formato inválido");
    }

    return [...data].sort(
      (first, second) => second.totalLoans - first.totalLoans,
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchRanking(controller.signal)
      .then((ranking) => setBooks(ranking))
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [fetchRanking]);

  async function retryLoading() {
    setIsLoading(true);
    setError(false);

    try {
      setBooks(await fetchRanking());
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const totalLoans = books.reduce(
    (total, book) => total + book.totalLoans,
    0,
  );

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-10">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center text-[#7f9f00]">
              <Trophy aria-hidden="true" className="size-6" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Ranking de livros mais emprestados
            </h1>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:w-80">
            <div className="rounded-md border border-secondary bg-secondary px-4 py-3 text-secondary-foreground">
              <dt className="text-xs font-medium text-secondary-foreground/80">
                Livros no ranking
              </dt>
              <dd className="mt-1 text-xl font-semibold text-secondary-foreground">
                {isLoading ? "—" : books.length}
              </dd>
            </div>
            <div className="rounded-md border border-secondary bg-secondary px-4 py-3 text-secondary-foreground">
              <dt className="text-xs font-medium text-secondary-foreground/80">
                Empréstimos
              </dt>
              <dd className="mt-1 text-xl font-semibold text-secondary-foreground">
                {isLoading ? "—" : totalLoans}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <section
        aria-labelledby="ranking-heading"
        className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="ranking-heading" className="text-lg font-semibold">
            Mais emprestados
          </h2>
          <span className="inline-flex rounded-md border border-secondary bg-secondary px-4 py-3 text-xs font-medium text-secondary-foreground">
            Ordenados pelo total de empréstimos
          </span>
        </div>

        {isLoading ? (
          <div
            aria-live="polite"
            className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-border bg-card px-6 text-center"
          >
            <LoaderCircle
              aria-hidden="true"
              className="size-7 animate-spin text-secondary"
            />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Carregando ranking...
            </p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <FeedbackMessage
              message="Não foi possível carregar o ranking. Verifique se a API está disponível e tente novamente."
              variant="error"
            />
            <Button onClick={() => void retryLoading()} variant="secondary">
              <RefreshCw aria-hidden="true" />
              Tentar novamente
            </Button>
          </div>
        ) : books.length > 0 ? (
          <ol className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_12px_32px_rgba(23,25,31,0.06)]">
            {books.map((book, index) => {
              const position = index + 1;

              return (
                <li
                  className="grid min-h-16 grid-cols-[auto_1fr] items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0 sm:grid-cols-[auto_1fr_auto] sm:px-5"
                  key={book.id}
                >
                  <div
                    aria-label={`${position}º lugar`}
                    className={`flex size-8 items-center justify-center text-sm font-bold ${
                      positionStyles[index] ??
                      "text-muted-foreground"
                    }`}
                  >
                    {position <= 3 ? (
                      <Medal aria-hidden="true" className="size-5" />
                    ) : (
                      position
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {position}º
                      </span>
                      <h3 className="truncate font-semibold text-foreground">
                        {book.title}
                      </h3>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {book.author}
                    </p>
                  </div>

                  <div className="col-start-2 flex items-center gap-2 sm:col-start-auto sm:justify-end">
                    <BookOpen
                      aria-hidden="true"
                      className="size-4 text-secondary"
                    />
                    <p className="text-sm text-muted-foreground">
                      <strong className="font-semibold text-foreground">
                        {book.totalLoans}
                      </strong>{" "}
                      {book.totalLoans === 1 ? "empréstimo" : "empréstimos"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-md bg-accent text-secondary">
              <Library aria-hidden="true" className="size-6" />
            </div>
            <h2 className="mt-4 text-base font-semibold">
              Nenhum empréstimo registrado
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              O ranking será exibido assim que o primeiro livro for
              emprestado.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export { RankingContent };

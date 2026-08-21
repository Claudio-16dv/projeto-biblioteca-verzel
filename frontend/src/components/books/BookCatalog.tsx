"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Book } from "@/types/book";
import type { User } from "@/types/user";
import { BookList } from "./BookList";
import { ReaderSelect } from "@/components/loans/ReaderSelect";
import { createLoan } from "@/services/loan.service";
import { FeedbackMessage } from "@/components/ui/feedback-message";

type BookCatalogProps = {
  books: Book[];
  users: User[];
};

export function BookCatalog({ books, users }: BookCatalogProps) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loaningBookId, setLoaningBookId] = useState<number | null>(null);
  const [loanError, setLoanError] = useState<string | null>(null);

  async function handleLoan(bookId: number) {
    if (selectedUserId === null) return;

    setLoanError(null);
    setLoaningBookId(bookId);

    try {
      await createLoan(bookId, selectedUserId);
      router.refresh();
    } catch (err) {
      setLoanError(
        err instanceof Error ? err.message : "Erro ao registrar o empréstimo",
      );
    } finally {
      setLoaningBookId(null);
    }
  }

  return (
    <div className="space-y-4">
      <ReaderSelect
        users={users}
        selectedUserId={selectedUserId}
        onChange={setSelectedUserId}
      />

      {selectedUserId === null && (
        <p className="text-sm">Selecione um leitor para emprestar livros</p>
      )}

      {loanError && <FeedbackMessage variant="error" message={loanError} />}

      {books.length === 0 && <p>Nenhum livro cadastrado</p>}

      {books.length > 0 && (
        <BookList
          books={books}
          canLoan={selectedUserId !== null}
          loaningBookId={loaningBookId}
          onLoan={handleLoan}
        />
      )}
    </div>
  );
}

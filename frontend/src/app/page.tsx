import { listBooks } from "@/services/book.service";
import { listUsers } from "@/services/user.service";
import { listLoans } from "@/services/loan.service";
import { BookForm } from "@/components/books/BookForm";
import { BookCatalog } from "@/components/books/BookCatalog";
import { LoanTable } from "@/components/loans/LoanTable";
import type { Book } from "@/types/book";
import type { User } from "@/types/user";
import type { Loan } from "@/types/loan";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let books: Book[] = [];
  let users: User[] = [];
  let loans: Loan[] = [];
  let error: string | null = null;

  try {
    const [booksData, usersData, loansData] = await Promise.all([
      listBooks(),
      listUsers(),
      listLoans(),
    ]);
    books = booksData;
    users = usersData;
    loans = loansData;
  } catch (err) {
    error = err instanceof Error ? err.message : "Erro ao carregar os dados";
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <section className="space-y-4">
        <h1 className="text-2xl font-medium">Acervo</h1>

        {error && <p role="alert">{error}</p>}
        {!error && <BookCatalog books={books} users={users} />}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Empréstimos ativos</h2>
        {!error && <LoanTable loans={loans} />}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-medium">Cadastrar livro</h2>
        <BookForm />
      </section>
    </main>
  );
}

import { PrismaClient } from '@prisma/client';
import { resetAndSeedCatalog } from './seed-catalog';

const prisma = new PrismaClient();

const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

type LoanFixture = {
  book: string;
  reader: string;
  loanedAt: Date;
  returnedAt?: Date;
};

/**
 * Movimentacao de demonstracao. `returnedAt` ausente significa emprestimo ativo.
 *
 * Cenarios cobertos:
 *  - Ana fica com 3 emprestimos ativos, entao um quarto deve ser recusado (BIBL-2).
 *  - "Grande Sertao" e "A Hora da Estrela" zeram as copias, entao emprestar
 *    qualquer um dos dois deve ser recusado (BIBL-2).
 *  - Devolvidos e ativos convivem, para o ranking medir historico (BIBL-3) e o
 *    filtro por situacao ter os dois lados (BIBL-4).
 *  - As datas se espalham por ~45 dias, para o filtro por periodo (BIBL-4).
 *  - Tres livros ficam sem nenhum emprestimo e nao podem aparecer no ranking.
 */
const LOANS: LoanFixture[] = [
  // Ana: 3 ativos, no limite.
  { book: 'Grande Sertao: Veredas', reader: 'Ana Ribeiro', loanedAt: daysAgo(2) },
  { book: 'A Hora da Estrela', reader: 'Ana Ribeiro', loanedAt: daysAgo(6) },
  { book: 'Dom Casmurro', reader: 'Ana Ribeiro', loanedAt: daysAgo(11) },

  // Bruno: 1 ativo e 2 devolvidos.
  { book: 'Grande Sertao: Veredas', reader: 'Bruno Alves', loanedAt: daysAgo(4) },
  { book: 'Vidas Secas', reader: 'Bruno Alves', loanedAt: daysAgo(30), returnedAt: daysAgo(21) },
  { book: 'Vidas Secas', reader: 'Bruno Alves', loanedAt: daysAgo(45), returnedAt: daysAgo(38) },

  // Carla: nenhum ativo, so historico.
  { book: 'Dom Casmurro', reader: 'Carla Mendes', loanedAt: daysAgo(40), returnedAt: daysAgo(33) },
  { book: 'Dom Casmurro', reader: 'Carla Mendes', loanedAt: daysAgo(18), returnedAt: daysAgo(9) },
  { book: 'Vidas Secas', reader: 'Carla Mendes', loanedAt: daysAgo(25), returnedAt: daysAgo(15) },
  { book: 'O Cortico', reader: 'Carla Mendes', loanedAt: daysAgo(50), returnedAt: daysAgo(44) },
];

/**
 * availableCopies e contador armazenado, e nao derivado dos emprestimos.
 * Um emprestimo ativo criado aqui precisa baixar a copia junto, senao o seed
 * nasce com o acervo inconsistente.
 */
async function createLoans(): Promise<void> {
  const [books, readers] = await Promise.all([
    prisma.book.findMany(),
    prisma.user.findMany(),
  ]);
  const bookByTitle = new Map(books.map((book) => [book.title, book]));
  const readerByName = new Map(readers.map((reader) => [reader.name, reader]));

  for (const fixture of LOANS) {
    const book = bookByTitle.get(fixture.book);
    const reader = readerByName.get(fixture.reader);

    if (!book || !reader) {
      throw new Error(`Fixture invalida: ${fixture.book} / ${fixture.reader}`);
    }

    await prisma.loan.create({
      data: {
        bookId: book.id,
        userId: reader.id,
        loanedAt: fixture.loanedAt,
        returnedAt: fixture.returnedAt ?? null,
      },
    });

    if (!fixture.returnedAt) {
      await prisma.book.update({
        where: { id: book.id },
        data: { availableCopies: { decrement: 1 } },
      });
    }
  }
}

/** Falha alto se o seed deixar o acervo inconsistente. */
async function assertCatalogIsConsistent(): Promise<void> {
  const books = await prisma.book.findMany({
    include: { _count: { select: { loans: { where: { returnedAt: null } } } } },
  });

  const inconsistent = books.filter(
    (book) => book.availableCopies + book._count.loans !== book.totalCopies,
  );

  if (inconsistent.length > 0) {
    throw new Error(
      `Acervo inconsistente: ${inconsistent.map((book) => book.title).join(', ')}`,
    );
  }
}

async function main(): Promise<void> {
  await resetAndSeedCatalog(prisma);
  await createLoans();
  await assertCatalogIsConsistent();

  const active = LOANS.filter((loan) => !loan.returnedAt).length;

  console.log(
    `Seed de demonstracao concluido: ${LOANS.length} emprestimos ` +
      `(${active} ativos, ${LOANS.length - active} devolvidos).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

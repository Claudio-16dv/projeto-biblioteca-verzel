import { PrismaClient } from '@prisma/client';
import { BOOKS, resetAndSeedCatalog, USERS } from './seed-catalog';

const prisma = new PrismaClient();

/**
 * Acervo sem nenhum emprestimo.
 *
 * E este o estado que demonstra o ranking vazio do BIBL-3 com o acervo
 * cheio. Para dados de movimentacao, use `npm run seed:demo`.
 */
async function main(): Promise<void> {
  await resetAndSeedCatalog(prisma);

  console.log(
    `Seed concluido: ${USERS.length} leitores, ${BOOKS.length} livros, nenhum emprestimo.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

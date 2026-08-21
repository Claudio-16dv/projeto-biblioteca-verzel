import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USERS = [{ name: 'Ana Ribeiro' }, { name: 'Bruno Alves' }, { name: 'Carla Mendes' }];

const BOOKS = [
  { title: 'Dom Casmurro', author: 'Machado de Assis', publicationYear: 1899, copies: 3 },
  { title: 'Grande Sertao: Veredas', author: 'Guimaraes Rosa', publicationYear: 1956, copies: 2 },
  { title: 'Vidas Secas', author: 'Graciliano Ramos', publicationYear: 1938, copies: 4 },
  { title: 'Memorias Postumas de Bras Cubas', author: 'Machado de Assis', publicationYear: 1881, copies: 2 },
  { title: 'A Hora da Estrela', author: 'Clarice Lispector', publicationYear: 1977, copies: 1 },
  { title: 'O Cortico', author: 'Aluisio Azevedo', publicationYear: 1890, copies: 3 },
  { title: 'Capitaes da Areia', author: 'Jorge Amado', publicationYear: 1937, copies: 2 },
  // Sem copias: cobre o caminho de erro do BIBL-2 e o estado desabilitado na tela.
  { title: 'Iracema', author: 'Jose de Alencar', publicationYear: 1865, copies: 0 },
];

async function main(): Promise<void> {
  // Ordem importa: Loan referencia Book e User.
  await prisma.loan.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({ data: USERS });
  await prisma.book.createMany({
    data: BOOKS.map(({ copies, ...book }) => ({
      ...book,
      totalCopies: copies,
      availableCopies: copies,
    })),
  });

  console.log(`Seed concluido: ${USERS.length} leitores, ${BOOKS.length} livros.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

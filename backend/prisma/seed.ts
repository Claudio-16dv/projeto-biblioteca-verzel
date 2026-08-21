import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const books = [
  { title: 'Dom Casmurro', author: 'Machado de Assis', publicationYear: 1899, copies: 3 },
  { title: 'O Cortiço', author: 'Aluísio Azevedo', publicationYear: 1890, copies: 2 },
  { title: 'Grande Sertão: Veredas', author: 'Guimarães Rosa', publicationYear: 1956, copies: 2 },
  { title: 'Capitães da Areia', author: 'Jorge Amado', publicationYear: 1937, copies: 1 },
  { title: 'A Hora da Estrela', author: 'Clarice Lispector', publicationYear: 1977, copies: 2 },
  { title: 'Vidas Secas', author: 'Graciliano Ramos', publicationYear: 1938, copies: 0 },
  { title: 'Iracema', author: 'José de Alencar', publicationYear: 1865, copies: 2 },
  { title: 'Memórias Póstumas de Brás Cubas', author: 'Machado de Assis', publicationYear: 1881, copies: 3 },
];

const users = ['Ana Silva', 'Bruno Costa', 'Carla Souza'];

async function main() {
  for (const book of books) {
    await prisma.book.create({
      data: {
        title: book.title,
        author: book.author,
        publicationYear: book.publicationYear,
        totalCopies: book.copies,
        availableCopies: book.copies,
      },
    });
  }

  for (const name of users) {
    await prisma.user.create({ data: { name } });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Book, User } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';
import { PrismaService } from './../src/prisma/prisma.service';

type LoanResponse = {
  id: number;
  book: Book;
  user: User;
  loanedAt: string;
  returnedAt: string | null;
  status: 'ativo' | 'devolvido';
};

type ErrorResponse = {
  statusCode: number;
  message: string;
  error: string;
};

/**
 * Cobre os invariantes do BIBL-2 contra o banco de verdade, exercitando a
 * transacao que os testes unitarios do service so conseguem simular.
 *
 * Roda contra o banco de desenvolvimento e limpa as tabelas antes de cada
 * teste. Depois da suite, recarregue o acervo com `npm run seed`.
 */
describe('Loans (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.loan.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  const createReader = (name = 'Ana Ribeiro'): Promise<User> =>
    prisma.user.create({ data: { name } });

  const createBook = (copies: number, title = 'Dom Casmurro'): Promise<Book> =>
    prisma.book.create({
      data: {
        title,
        author: 'Machado de Assis',
        publicationYear: 1899,
        totalCopies: copies,
        availableCopies: copies,
      },
    });

  const emprestar = (bookId: number, userId: number) =>
    request(app.getHttpServer()).post('/loans').send({ bookId, userId });

  const devolver = (loanId: number) =>
    request(app.getHttpServer()).patch(`/loans/${loanId}/return`);

  const availableCopies = async (bookId: number): Promise<number> => {
    const book = await prisma.book.findUniqueOrThrow({ where: { id: bookId } });
    return book.availableCopies;
  };

  describe('POST /loans', () => {
    it('registra o emprestimo e baixa uma copia do livro', async () => {
      const [reader, book] = await Promise.all([createReader(), createBook(2)]);

      const { body } = (await emprestar(book.id, reader.id).expect(201)) as {
        body: LoanResponse;
      };

      expect(body.status).toBe('ativo');
      expect(body.returnedAt).toBeNull();
      await expect(availableCopies(book.id)).resolves.toBe(1);
    });

    it('recusa quando o livro esta sem copias disponiveis', async () => {
      const [reader, book] = await Promise.all([createReader(), createBook(0)]);

      const { body } = (await emprestar(book.id, reader.id).expect(409)) as {
        body: ErrorResponse;
      };

      expect(body.message).toBe('Livro sem cópias disponíveis');
    });

    it('nao deixa o acervo negativo quando a ultima copia acaba', async () => {
      const [ana, bruno, book] = await Promise.all([
        createReader('Ana Ribeiro'),
        createReader('Bruno Alves'),
        createBook(1),
      ]);

      await emprestar(book.id, ana.id).expect(201);
      await emprestar(book.id, bruno.id).expect(409);

      await expect(availableCopies(book.id)).resolves.toBe(0);
    });

    it('recusa o quarto emprestimo ativo do mesmo leitor', async () => {
      const reader = await createReader();
      const books = await Promise.all([
        createBook(1, 'Livro A'),
        createBook(1, 'Livro B'),
        createBook(1, 'Livro C'),
        createBook(1, 'Livro D'),
      ]);

      for (const book of books.slice(0, 3)) {
        await emprestar(book.id, reader.id).expect(201);
      }

      const { body } = (await emprestar(books[3].id, reader.id).expect(409)) as {
        body: ErrorResponse;
      };

      expect(body.message).toBe('Limite de 3 empréstimos ativos atingido');
    });

    it('nao conta emprestimos devolvidos no limite de 3', async () => {
      const reader = await createReader();
      const books = await Promise.all([
        createBook(1, 'Livro A'),
        createBook(1, 'Livro B'),
        createBook(1, 'Livro C'),
        createBook(1, 'Livro D'),
      ]);

      for (const book of books.slice(0, 3)) {
        const { body } = (await emprestar(book.id, reader.id).expect(201)) as {
          body: LoanResponse;
        };
        await devolver(body.id).expect(200);
      }

      await emprestar(books[3].id, reader.id).expect(201);
    });
  });

  describe('PATCH /loans/:id/return', () => {
    it('encerra o emprestimo e repoe a copia', async () => {
      const [reader, book] = await Promise.all([createReader(), createBook(1)]);
      const { body: loan } = (await emprestar(book.id, reader.id).expect(201)) as {
        body: LoanResponse;
      };

      const { body } = (await devolver(loan.id).expect(200)) as {
        body: LoanResponse;
      };

      expect(body.status).toBe('devolvido');
      expect(body.returnedAt).not.toBeNull();
      await expect(availableCopies(book.id)).resolves.toBe(1);
    });

    it('recusa devolver um emprestimo ja devolvido', async () => {
      const [reader, book] = await Promise.all([createReader(), createBook(1)]);
      const { body: loan } = (await emprestar(book.id, reader.id).expect(201)) as {
        body: LoanResponse;
      };
      await devolver(loan.id).expect(200);

      const { body } = (await devolver(loan.id).expect(409)) as {
        body: ErrorResponse;
      };

      expect(body.message).toBe('Empréstimo já devolvido');
      // A copia nao pode voltar duas vezes.
      await expect(availableCopies(book.id)).resolves.toBe(1);
    });

    it('devolve 404 para emprestimo inexistente', async () => {
      await devolver(999999).expect(404);
    });
  });
});

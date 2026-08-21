import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';
import { PrismaService } from './../src/prisma/prisma.service';

type BookResponse = {
  id: number;
  title: string;
  author: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
};

type RankingItem = {
  id: number;
  title: string;
  author: string;
  totalLoans: number;
};

type ErrorResponse = {
  statusCode: number;
  message: string;
  error: string;
};

const NEXT_YEAR = new Date().getFullYear() + 1;

const validBook = {
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  publicationYear: 1899,
  copies: 3,
};

/**
 * Roda contra o banco de desenvolvimento e limpa as tabelas antes de cada
 * teste. Depois de rodar a suite, recarregue o acervo com `npm run seed`.
 */
describe('Books (e2e)', () => {
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
    // Ordem importa: Loan referencia Book e User.
    await prisma.loan.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /books', () => {
    it('cadastra o livro e devolve o registro criado', async () => {
      const { body } = (await request(app.getHttpServer())
        .post('/books')
        .send(validBook)
        .expect(201)) as { body: BookResponse };

      expect(body).toMatchObject({
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        publicationYear: 1899,
        totalCopies: 3,
        availableCopies: 3,
      });
      expect(body.id).toEqual(expect.any(Number));
    });

    it('aceita zero copias', async () => {
      await request(app.getHttpServer())
        .post('/books')
        .send({ ...validBook, copies: 0 })
        .expect(201);
    });

    it('remove os espacos em volta do titulo', async () => {
      const { body } = (await request(app.getHttpServer())
        .post('/books')
        .send({ ...validBook, title: '  Vidas Secas  ' })
        .expect(201)) as { body: BookResponse };

      expect(body.title).toBe('Vidas Secas');
    });

    it('recusa titulo vazio', async () => {
      const { body } = (await request(app.getHttpServer())
        .post('/books')
        .send({ ...validBook, title: '' })
        .expect(400)) as { body: ErrorResponse };

      expect(body.message).toBe('Titulo e obrigatorio.');
    });

    it('recusa titulo composto apenas de espacos', async () => {
      const { body } = (await request(app.getHttpServer())
        .post('/books')
        .send({ ...validBook, title: '   ' })
        .expect(400)) as { body: ErrorResponse };

      expect(body.message).toBe('Titulo e obrigatorio.');
    });

    it('recusa ano no futuro', async () => {
      const { body } = (await request(app.getHttpServer())
        .post('/books')
        .send({ ...validBook, publicationYear: NEXT_YEAR })
        .expect(400)) as { body: ErrorResponse };

      expect(body.message).toBe('Ano de publicacao nao pode estar no futuro.');
    });

    it('recusa quantidade de copias negativa', async () => {
      const { body } = (await request(app.getHttpServer())
        .post('/books')
        .send({ ...validBook, copies: -1 })
        .expect(400)) as { body: ErrorResponse };

      expect(body.message).toBe('Quantidade de copias nao pode ser negativa.');
    });

    it('devolve message como string mesmo com varias falhas de validacao', async () => {
      const { body } = (await request(app.getHttpServer())
        .post('/books')
        .send({ title: '', author: '', publicationYear: NEXT_YEAR, copies: -1 })
        .expect(400)) as { body: ErrorResponse };

      expect(typeof body.message).toBe('string');
      expect(body).toMatchObject({ statusCode: 400, error: 'Bad Request' });
    });
  });

  describe('GET /books', () => {
    it('devolve lista vazia quando nao ha livros', async () => {
      await request(app.getHttpServer()).get('/books').expect(200).expect([]);
    });

    it('lista os livros cadastrados', async () => {
      await request(app.getHttpServer())
        .post('/books')
        .send(validBook)
        .expect(201);

      const { body } = (await request(app.getHttpServer())
        .get('/books')
        .expect(200)) as { body: BookResponse[] };

      expect(body).toHaveLength(1);
      expect(body[0]).toMatchObject({
        title: 'Dom Casmurro',
        availableCopies: 3,
      });
    });
  });

  describe('GET /books/ranking', () => {
    const seedLoans = async () => {
      const reader = await prisma.user.create({
        data: { name: 'Ana Ribeiro' },
      });
      const [procurado, ocasional] = await Promise.all([
        prisma.book.create({
          data: {
            title: 'Vidas Secas',
            author: 'Graciliano Ramos',
            publicationYear: 1938,
            totalCopies: 4,
            availableCopies: 4,
          },
        }),
        prisma.book.create({
          data: {
            title: 'Dom Casmurro',
            author: 'Machado de Assis',
            publicationYear: 1899,
            totalCopies: 3,
            availableCopies: 3,
          },
        }),
      ]);
      // Livro nunca emprestado: nao pode aparecer no ranking.
      await prisma.book.create({
        data: {
          title: 'Iracema',
          author: 'Jose de Alencar',
          publicationYear: 1865,
          totalCopies: 1,
          availableCopies: 1,
        },
      });

      await prisma.loan.createMany({
        data: [
          // Devolvido tambem conta: o ranking olha o historico completo.
          { bookId: procurado.id, userId: reader.id, returnedAt: new Date() },
          { bookId: procurado.id, userId: reader.id, returnedAt: new Date() },
          { bookId: ocasional.id, userId: reader.id },
        ],
      });

      return { procurado, ocasional };
    };

    it('devolve lista vazia quando nenhum livro foi emprestado', async () => {
      await request(app.getHttpServer())
        .post('/books')
        .send(validBook)
        .expect(201);

      await request(app.getHttpServer())
        .get('/books/ranking')
        .expect(200)
        .expect([]);
    });

    it('ordena do mais emprestado para o menos', async () => {
      const { procurado, ocasional } = await seedLoans();

      const { body } = (await request(app.getHttpServer())
        .get('/books/ranking')
        .expect(200)) as { body: RankingItem[] };

      expect(body).toEqual([
        {
          id: procurado.id,
          title: 'Vidas Secas',
          author: 'Graciliano Ramos',
          totalLoans: 2,
        },
        {
          id: ocasional.id,
          title: 'Dom Casmurro',
          author: 'Machado de Assis',
          totalLoans: 1,
        },
      ]);
    });

    it('nao inclui livros que nunca foram emprestados', async () => {
      await seedLoans();

      const { body } = (await request(app.getHttpServer())
        .get('/books/ranking')
        .expect(200)) as { body: RankingItem[] };

      expect(body.map((item: { title: string }) => item.title)).not.toContain(
        'Iracema',
      );
    });
  });
});

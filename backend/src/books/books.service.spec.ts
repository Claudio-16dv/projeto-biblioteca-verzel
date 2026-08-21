import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Book } from '@prisma/client';
import { BooksRepository } from './books.repository';
import { BooksService } from './books.service';

const makeBook = (overrides: Partial<Book> = {}): Book => ({
  id: 1,
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  publicationYear: 1899,
  totalCopies: 3,
  availableCopies: 3,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

describe('BooksService', () => {
  let service: BooksService;
  let repository: jest.Mocked<BooksRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findManyByIds: jest.fn(),
      countLoansByBook: jest.fn(),
    } as unknown as jest.Mocked<BooksRepository>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: BooksRepository, useValue: repository },
      ],
    }).compile();

    service = moduleRef.get(BooksService);
  });

  describe('create', () => {
    it('faz o acervo total nascer igual as copias informadas', async () => {
      repository.create.mockResolvedValue(makeBook());

      await service.create({
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        publicationYear: 1899,
        copies: 3,
      });

      expect(repository.create).toHaveBeenCalledWith({
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        publicationYear: 1899,
        totalCopies: 3,
        availableCopies: 3,
      });
    });

    it('aceita cadastro com zero copias', async () => {
      repository.create.mockResolvedValue(
        makeBook({ totalCopies: 0, availableCopies: 0 }),
      );

      await service.create({
        title: 'Iracema',
        author: 'Jose de Alencar',
        publicationYear: 1865,
        copies: 0,
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ totalCopies: 0, availableCopies: 0 }),
      );
    });
  });

  describe('findById', () => {
    it('devolve o livro quando ele existe', async () => {
      const book = makeBook({ id: 7 });
      repository.findById.mockResolvedValue(book);

      await expect(service.findById(7)).resolves.toBe(book);
    });

    it('lanca NotFoundException quando o livro nao existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findRanking', () => {
    it('devolve lista vazia quando nenhum livro foi emprestado', async () => {
      repository.countLoansByBook.mockResolvedValue([]);

      await expect(service.findRanking()).resolves.toEqual([]);
    });

    it('nao consulta livros quando nao ha emprestimos', async () => {
      repository.countLoansByBook.mockResolvedValue([]);

      await service.findRanking();

      expect(repository.findManyByIds).not.toHaveBeenCalled();
    });

    it('preserva a ordem do repositorio e hidrata titulo e autor', async () => {
      repository.countLoansByBook.mockResolvedValue([
        { bookId: 2, totalLoans: 5 },
        { bookId: 1, totalLoans: 2 },
      ]);
      repository.findManyByIds.mockResolvedValue([
        makeBook({ id: 1, title: 'Dom Casmurro', author: 'Machado de Assis' }),
        makeBook({ id: 2, title: 'Vidas Secas', author: 'Graciliano Ramos' }),
      ]);

      await expect(service.findRanking()).resolves.toEqual([
        {
          id: 2,
          title: 'Vidas Secas',
          author: 'Graciliano Ramos',
          totalLoans: 5,
        },
        {
          id: 1,
          title: 'Dom Casmurro',
          author: 'Machado de Assis',
          totalLoans: 2,
        },
      ]);
    });

    it('ignora contagem cujo livro nao existe mais', async () => {
      repository.countLoansByBook.mockResolvedValue([
        { bookId: 1, totalLoans: 4 },
        { bookId: 99, totalLoans: 1 },
      ]);
      repository.findManyByIds.mockResolvedValue([makeBook({ id: 1 })]);

      const ranking = await service.findRanking();

      expect(ranking).toHaveLength(1);
      expect(ranking[0].id).toBe(1);
    });
  });
});

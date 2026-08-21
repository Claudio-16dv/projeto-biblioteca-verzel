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
});

import { Test } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LoansService } from './loans.service';
import { LoansRepository } from './loans.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('LoansService', () => {
  let service: LoansService;
  let repository: jest.Mocked<LoansRepository>;

  const book = {
    id: 1,
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    publicationYear: 1899,
    totalCopies: 1,
    availableCopies: 1,
    createdAt: new Date(),
  };
  const user = { id: 1, name: 'Ana Silva' };
  const now = new Date();

  beforeEach(async () => {
    const prismaMock = {
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb({})),
    };

    const repositoryMock = {
      countActiveByUser: jest.fn(),
      decrementAvailableCopies: jest.fn(),
      incrementAvailableCopies: jest.fn(),
      create: jest.fn(),
      markReturned: jest.fn(),
      findById: jest.fn(),
      findByIdWithRelations: jest.fn(),
      findAll: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: LoansRepository, useValue: repositoryMock },
      ],
    }).compile();

    service = moduleRef.get(LoansService);
    repository = moduleRef.get(LoansRepository);
  });

  describe('create', () => {
    it('creates a loan when under the limit and a copy is available', async () => {
      repository.countActiveByUser.mockResolvedValue(0);
      repository.decrementAvailableCopies.mockResolvedValue({ count: 1 });
      repository.create.mockResolvedValue({
        id: 10,
        bookId: book.id,
        userId: user.id,
        loanedAt: now,
        returnedAt: null,
      });
      repository.findByIdWithRelations.mockResolvedValue({
        id: 10,
        bookId: book.id,
        userId: user.id,
        loanedAt: now,
        returnedAt: null,
        book,
        user,
      });

      const result = await service.create({ bookId: book.id, userId: user.id });

      expect(result.status).toBe('ativo');
      expect(result.id).toBe(10);
    });

    it('rejects when the user already has 3 active loans', async () => {
      repository.countActiveByUser.mockResolvedValue(3);

      await expect(
        service.create({ bookId: book.id, userId: user.id }),
      ).rejects.toThrow(ConflictException);
      expect(repository.decrementAvailableCopies).not.toHaveBeenCalled();
    });

    it('rejects when the book has no available copies', async () => {
      repository.countActiveByUser.mockResolvedValue(0);
      repository.decrementAvailableCopies.mockResolvedValue({ count: 0 });

      await expect(
        service.create({ bookId: book.id, userId: user.id }),
      ).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('maps a foreign key violation on the user to NotFoundException', async () => {
      repository.countActiveByUser.mockResolvedValue(0);
      repository.decrementAvailableCopies.mockResolvedValue({ count: 1 });
      repository.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('foreign key violation', {
          code: 'P2003',
          clientVersion: '5.22.0',
        }),
      );

      await expect(
        service.create({ bookId: book.id, userId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('returnLoan', () => {
    it('marks the loan as returned and restores the copy', async () => {
      repository.findById.mockResolvedValue({
        id: 10,
        bookId: book.id,
        userId: user.id,
        loanedAt: now,
        returnedAt: null,
      });
      repository.findByIdWithRelations.mockResolvedValue({
        id: 10,
        bookId: book.id,
        userId: user.id,
        loanedAt: now,
        returnedAt: new Date(),
        book,
        user,
      });

      const result = await service.returnLoan(10);

      expect(result.status).toBe('devolvido');
      expect(repository.markReturned).toHaveBeenCalledWith(10, {});
      expect(repository.incrementAvailableCopies).toHaveBeenCalledWith(
        book.id,
        {},
      );
    });

    it('throws NotFoundException for an unknown loan', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.returnLoan(999)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when the loan was already returned', async () => {
      repository.findById.mockResolvedValue({
        id: 10,
        bookId: book.id,
        userId: user.id,
        loanedAt: now,
        returnedAt: new Date(),
      });

      await expect(service.returnLoan(10)).rejects.toThrow(ConflictException);
      expect(repository.markReturned).not.toHaveBeenCalled();
    });
  });
});

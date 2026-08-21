import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type PrismaClientOrTx = PrismaService | Prisma.TransactionClient;

@Injectable()
export class LoansRepository {
  constructor(private readonly prisma: PrismaService) {}

  countActiveByUser(userId: number, client: PrismaClientOrTx = this.prisma) {
    return client.loan.count({ where: { userId, returnedAt: null } });
  }

  decrementAvailableCopies(
    bookId: number,
    client: PrismaClientOrTx = this.prisma,
  ) {
    return client.book.updateMany({
      where: { id: bookId, availableCopies: { gt: 0 } },
      data: { availableCopies: { decrement: 1 } },
    });
  }

  incrementAvailableCopies(
    bookId: number,
    client: PrismaClientOrTx = this.prisma,
  ) {
    return client.book.update({
      where: { id: bookId },
      data: { availableCopies: { increment: 1 } },
    });
  }

  create(
    data: { bookId: number; userId: number },
    client: PrismaClientOrTx = this.prisma,
  ) {
    return client.loan.create({ data });
  }

  markReturned(id: number, client: PrismaClientOrTx = this.prisma) {
    return client.loan.update({
      where: { id },
      data: { returnedAt: new Date() },
    });
  }

  findById(id: number, client: PrismaClientOrTx = this.prisma) {
    return client.loan.findUnique({ where: { id } });
  }

  findByIdWithRelations(id: number, client: PrismaClientOrTx = this.prisma) {
    return client.loan.findUnique({
      where: { id },
      include: { book: true, user: true },
    });
  }

  findAll() {
    return this.prisma.loan.findMany({
      include: { book: true, user: true },
      orderBy: { loanedAt: 'desc' },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoanFilterDto } from './dto/loan-filter.dto';

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

  /**
   * BIBL-4/BIBL-5: lista empréstimos aplicando filtros opcionais combinados em
   * AND. Sem filtro, retorna tudo. Reusada pela exportação CSV.
   */
  findWithFilters(filter: LoanFilterDto = {}) {
    const where: Prisma.LoanWhereInput = {};

    if (filter.userId !== undefined) {
      where.userId = filter.userId;
    }

    if (filter.status === 'ativo') {
      where.returnedAt = null;
    } else if (filter.status === 'devolvido') {
      where.returnedAt = { not: null };
    }

    // Período sobre loanedAt (UTC). Filtro chega como YYYY-MM-DD.
    const loanedAt: Prisma.DateTimeFilter = {};
    if (filter.from) {
      loanedAt.gte = new Date(`${filter.from}T00:00:00.000Z`);
    }
    if (filter.to) {
      // `to` inclusivo → menor que o dia seguinte às 00:00 UTC.
      const nextDay = new Date(`${filter.to}T00:00:00.000Z`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      loanedAt.lt = nextDay;
    }
    if (Object.keys(loanedAt).length > 0) {
      where.loanedAt = loanedAt;
    }

    return this.prisma.loan.findMany({
      where,
      include: { book: true, user: true },
      orderBy: { loanedAt: 'desc' },
    });
  }
}

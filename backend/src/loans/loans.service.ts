import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoansRepository } from './loans.repository';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanFilterDto } from './dto/loan-filter.dto';
import { toLoanResponse } from './loans.mapper';

const MAX_ACTIVE_LOANS_PER_USER = 3;

@Injectable()
export class LoansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loansRepository: LoansRepository,
  ) {}

  async create(dto: CreateLoanDto) {
    const loanId = await this.prisma.$transaction(async (tx) => {
      const activeLoans = await this.loansRepository.countActiveByUser(
        dto.userId,
        tx,
      );
      if (activeLoans >= MAX_ACTIVE_LOANS_PER_USER) {
        throw new ConflictException('Limite de 3 empréstimos ativos atingido');
      }

      const updated = await this.loansRepository.decrementAvailableCopies(
        dto.bookId,
        tx,
      );
      if (updated.count === 0) {
        throw new ConflictException('Livro sem cópias disponíveis');
      }

      try {
        const loan = await this.loansRepository.create(
          { bookId: dto.bookId, userId: dto.userId },
          tx,
        );
        return loan.id;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2003'
        ) {
          throw new NotFoundException('Usuário não encontrado');
        }
        throw error;
      }
    });

    const loan = await this.loansRepository.findByIdWithRelations(loanId);
    return toLoanResponse(loan!);
  }

  async returnLoan(id: number) {
    const loanId = await this.prisma.$transaction(async (tx) => {
      const loan = await this.loansRepository.findById(id, tx);
      if (!loan) {
        throw new NotFoundException('Empréstimo não encontrado');
      }
      if (loan.returnedAt) {
        throw new ConflictException('Empréstimo já devolvido');
      }

      await this.loansRepository.markReturned(id, tx);
      await this.loansRepository.incrementAvailableCopies(loan.bookId, tx);
      return loan.id;
    });

    const loan = await this.loansRepository.findByIdWithRelations(loanId);
    return toLoanResponse(loan!);
  }

  async findAll(filter: LoanFilterDto = {}) {
    const loans = await this.loansRepository.findWithFilters(filter);
    return loans.map(toLoanResponse);
  }
}

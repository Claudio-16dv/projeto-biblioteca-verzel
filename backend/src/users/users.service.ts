import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type UserSummary = { id: number; name: string };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Alimenta o seletor de leitor no emprestimo (BIBL-2) e o filtro do relatorio (BIBL-4). */
  findAll(): Promise<UserSummary[]> {
    return this.prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { Book } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type NewBook = {
  title: string;
  author: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
};

export type BookLoanCount = {
  bookId: number;
  totalLoans: number;
};

@Injectable()
export class BooksRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewBook): Promise<Book> {
    return this.prisma.book.create({ data });
  }

  findAll(): Promise<Book[]> {
    return this.prisma.book.findMany({ orderBy: { title: 'asc' } });
  }

  findById(id: number): Promise<Book | null> {
    return this.prisma.book.findUnique({ where: { id } });
  }

  findManyByIds(ids: number[]): Promise<Book[]> {
    return this.prisma.book.findMany({ where: { id: { in: ids } } });
  }

  /**
   * Total de emprestimos por livro, do mais procurado ao menos, contando
   * ativos e devolvidos.
   *
   * Livros nunca emprestados nao aparecem: e o que permite o estado vazio
   * exigido pelo BIBL-3 quando o acervo existe mas nada foi emprestado.
   */
  async countLoansByBook(): Promise<BookLoanCount[]> {
    const grouped = await this.prisma.loan.groupBy({
      by: ['bookId'],
      _count: { bookId: true },
      orderBy: { _count: { bookId: 'desc' } },
    });

    return grouped.map((row) => ({
      bookId: row.bookId,
      totalLoans: row._count.bookId,
    }));
  }
}

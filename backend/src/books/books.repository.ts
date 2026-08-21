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

@Injectable()
export class BooksRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewBook): Promise<Book> {
    return this.prisma.book.create({ data });
  }

  findAll(): Promise<Book[]> {
    return this.prisma.book.findMany({ orderBy: { title: 'asc' } });
  }
}

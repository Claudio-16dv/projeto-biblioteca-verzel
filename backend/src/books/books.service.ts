import { Injectable } from '@nestjs/common';
import { Book } from '@prisma/client';
import { BooksRepository } from './books.repository';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly booksRepository: BooksRepository) {}

  /**
   * O acervo total nasce igual as copias informadas no cadastro e nao muda:
   * emprestimo e devolucao mexem apenas em availableCopies.
   */
  create(dto: CreateBookDto): Promise<Book> {
    return this.booksRepository.create({
      title: dto.title,
      author: dto.author,
      publicationYear: dto.publicationYear,
      totalCopies: dto.copies,
      availableCopies: dto.copies,
    });
  }

  findAll(): Promise<Book[]> {
    return this.booksRepository.findAll();
  }
}

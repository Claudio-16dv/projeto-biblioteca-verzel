import { Injectable, NotFoundException } from '@nestjs/common';
import { Book } from '@prisma/client';
import { BooksRepository } from './books.repository';
import { CreateBookDto } from './dto/create-book.dto';

export type RankedBook = {
  id: number;
  title: string;
  author: string;
  totalLoans: number;
};

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

  async findById(id: number): Promise<Book> {
    const book = await this.booksRepository.findById(id);

    if (!book) {
      throw new NotFoundException('Livro não encontrado.');
    }

    return book;
  }

  /** BIBL-3: livros ordenados pela quantidade de vezes que foram emprestados. */
  async findRanking(): Promise<RankedBook[]> {
    const loanCounts = await this.booksRepository.countLoansByBook();

    if (loanCounts.length === 0) {
      return [];
    }

    const books = await this.booksRepository.findManyByIds(
      loanCounts.map(({ bookId }) => bookId),
    );
    const booksById = new Map(books.map((book) => [book.id, book]));

    // A ordem vem do repositorio; aqui so hidratamos titulo e autor.
    return loanCounts.flatMap(({ bookId, totalLoans }) => {
      const book = booksById.get(bookId);

      return book
        ? [{ id: book.id, title: book.title, author: book.author, totalLoans }]
        : [];
    });
  }
}

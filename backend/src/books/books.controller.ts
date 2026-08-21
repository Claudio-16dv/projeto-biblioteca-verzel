import { Body, Controller, Get, Post } from '@nestjs/common';
import { Book } from '@prisma/client';
import { BooksService, RankedBook } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  create(@Body() dto: CreateBookDto): Promise<Book> {
    return this.booksService.create(dto);
  }

  @Get()
  findAll(): Promise<Book[]> {
    return this.booksService.findAll();
  }

  // Precisa vir antes de qualquer @Get(':id') para nao ser lido como parametro.
  @Get('ranking')
  findRanking(): Promise<RankedBook[]> {
    return this.booksService.findRanking();
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Book } from '@prisma/client';
import { BooksService, RankedBook } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';

/** Mantem o texto do erro em portugues, como o resto da API. */
const parseBookId = new ParseIntPipe({
  exceptionFactory: () =>
    new BadRequestException('Identificador do livro deve ser um número.'),
});

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

  // Precisa vir antes de @Get(':id') para nao ser lido como parametro.
  @Get('ranking')
  findRanking(): Promise<RankedBook[]> {
    return this.booksService.findRanking();
  }

  @Get(':id')
  findById(@Param('id', parseBookId) id: number): Promise<Book> {
    return this.booksService.findById(id);
  }
}

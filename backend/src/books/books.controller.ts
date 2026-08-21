import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Book } from '@prisma/client';
import { ApiErrorDto } from '../common/dto/api-error.dto';
import { BooksService, RankedBook } from './books.service';
import { BookResponseDto, RankedBookDto } from './dto/book-response.dto';
import { CreateBookDto } from './dto/create-book.dto';

/** Mantem o texto do erro em portugues, como o resto da API. */
const parseBookId = new ParseIntPipe({
  exceptionFactory: () =>
    new BadRequestException('Identificador do livro deve ser um número.'),
});

@ApiTags('livros')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um livro no acervo' })
  @ApiCreatedResponse({ type: BookResponseDto })
  @ApiBadRequestResponse({
    description: 'Título vazio, ano no futuro ou quantidade de cópias negativa',
    type: ApiErrorDto,
  })
  create(@Body() dto: CreateBookDto): Promise<Book> {
    return this.booksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista o acervo, ordenado por título' })
  @ApiOkResponse({ type: [BookResponseDto] })
  findAll(): Promise<Book[]> {
    return this.booksService.findAll();
  }

  // Precisa vir antes de @Get(':id') para nao ser lido como parametro.
  @Get('ranking')
  @ApiOperation({
    summary: 'Ranking de livros mais emprestados',
    description:
      'Conta empréstimos ativos e devolvidos. Livros nunca emprestados ficam de fora, ' +
      'então a lista vem vazia enquanto nada tiver sido emprestado.',
  })
  @ApiOkResponse({ type: [RankedBookDto] })
  findRanking(): Promise<RankedBook[]> {
    return this.booksService.findRanking();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um livro pelo identificador' })
  @ApiOkResponse({ type: BookResponseDto })
  @ApiNotFoundResponse({ description: 'Livro inexistente', type: ApiErrorDto })
  findById(@Param('id', parseBookId) id: number): Promise<Book> {
    return this.booksService.findById(id);
  }
}

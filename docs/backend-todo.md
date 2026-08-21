# Backend TODO — Biblioteca Comunitária (NestJS)

## Decisões

| # | Decisão | Escolha |
|---|---|---|
| 1 | Organização | Feature modules (`src/books/`, `src/loans/`, `src/users/`) |
| 2 | ORM | Prisma — sem pasta `models/`, os tipos são gerados |
| 3 | Banco | PostgreSQL em Docker; API roda no host |
| 4 | Cópias | `totalCopies` imutável + `availableCopies` mutável |
| 5 | Situação do empréstimo | Derivada de `returnedAt` (sem campo `status`) |
| 6 | Usuário | Entidade `User` + seed |
| 7 | Período do BIBL-4 | Filtra `loanedAt` |
| 8 | Ranking | Só livros com ≥ 1 empréstimo |
| 9 | Porta da API | 3001 (3000 é do Next) |
| 10 | Validação | DTO + `class-validator` + `ValidationPipe` global |
| 11 | Erros | `HttpException` + Exception Filter |

## Estrutura

```text
backend/
├── docker-compose.yml          # só o Postgres
├── .env.example
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── prisma/          prisma.module.ts · prisma.service.ts
    ├── common/filters/  http-exception.filter.ts
    ├── books/           module · controller · service · repository · dto/
    ├── loans/           module · controller · service · repository · export.service · dto/
    └── users/           module · controller · service
```

## Fase 0 — Base

- [ ] `nest new backend --package-manager npm`
- [ ] `main.ts` — `app.enableCors({ origin: 'http://localhost:3000', exposedHeaders: ['Content-Disposition'] })`
- [ ] `main.ts` — `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`
- [ ] `main.ts` — `await app.listen(3001)`
- [ ] `common/filters/http-exception.filter.ts`
- [ ] `docker-compose.yml` — serviço `postgres` com volume nomeado
- [ ] `.env.example` (`DATABASE_URL`, `PORT=3001`) · `.gitignore` · `.dockerignore`
- [ ] `npm i prisma @prisma/client` + `npx prisma init --datasource-provider postgresql`
- [ ] `prisma/schema.prisma`
- [ ] `npx prisma migrate dev --name init`
- [ ] `PrismaService extends PrismaClient` + `PrismaModule` global
- [ ] `prisma/seed.ts` — 8 livros + 3 leitores, registrado no `package.json`

### Schema

```prisma
model Book {
  id              Int      @id @default(autoincrement())
  title           String
  author          String
  publicationYear Int
  totalCopies     Int
  availableCopies Int
  loans           Loan[]
  createdAt       DateTime @default(now())
}

model User {
  id    Int    @id @default(autoincrement())
  name  String
  loans Loan[]
}

model Loan {
  id         Int       @id @default(autoincrement())
  bookId     Int
  userId     Int
  book       Book      @relation(fields: [bookId], references: [id])
  user       User      @relation(fields: [userId], references: [id])
  loanedAt   DateTime  @default(now())
  returnedAt DateTime?              // null = ativo

  @@index([userId, returnedAt])
  @@index([bookId])
}
```

## BIBL-1 — Cadastro e listagem `3pts`

- [ ] `nest g resource books`
- [ ] `dto/create-book.dto.ts`
  - [ ] `title` — `@IsString() @IsNotEmpty()` + `@Transform` com `trim()`
  - [ ] `author` — `@IsString() @IsNotEmpty()`
  - [ ] `publicationYear` — `@IsInt() @Max(new Date().getFullYear())`
  - [ ] `copies` — `@IsInt() @Min(0)` (0 é válido, só negativo é recusado)
- [ ] `books.repository.ts` — `create`, `findAll`
- [ ] `books.service.ts` — no create, `totalCopies = availableCopies = copies`
- [ ] `@Post()` retorna o livro criado com `id`
- [ ] `@Get()` retorna a lista com `availableCopies`

## BIBL-2 — Empréstimo e devolução `5pts`

- [ ] `nest g resource loans`
- [ ] `dto/create-loan.dto.ts` — `bookId`, `userId`
- [ ] `loans.repository.ts` — `create`, `countActiveByUser`, `markReturned`, `findById`
- [ ] `loans.service.ts` — `create` dentro de `prisma.$transaction`:

  ```ts
  const ativos = await tx.loan.count({ where: { userId, returnedAt: null } });
  if (ativos >= 3) throw new ConflictException('Limite de 3 empréstimos ativos atingido');

  const r = await tx.book.updateMany({
    where: { id: bookId, availableCopies: { gt: 0 } },
    data:  { availableCopies: { decrement: 1 } },
  });
  if (r.count === 0) throw new ConflictException('Livro sem cópias disponíveis');

  return tx.loan.create({ data: { bookId, userId } });
  ```

- [ ] `return` também em transação — `returnedAt = now()` + `increment: 1`
- [ ] Devolver empréstimo já devolvido → `ConflictException`
- [ ] `@Post('/loans')` e `@Patch('/loans/:id/return')` retornam o livro com `availableCopies` atualizado

## BIBL-3 — Ranking `3pts`

- [ ] `books.repository.ts` — `findRanking()` via `prisma.loan.groupBy`
  - [ ] agrupa por `bookId`, conta ativos + devolvidos
  - [ ] ordena por contagem desc
  - [ ] hidrata título e autor
- [ ] `@Get('/books/ranking')` → `[{ id, title, author, totalLoans }]`
- [ ] Nenhum empréstimo registrado → `200` com `[]` (acervo pode estar cheio)

## BIBL-4 — Relatório `5pts`

- [ ] `dto/loan-filter.dto.ts` — todos `@IsOptional()`
  - [ ] `userId` — `@Type(() => Number)`, query param chega como string
  - [ ] `from` / `to` — `@IsDateString()`
  - [ ] `status` — `@IsIn(['ativo', 'devolvido'])`
- [ ] `loans.repository.ts` — `findWithFilters(filtro)`, função única (BIBL-5 reusa)
  - [ ] filtros combinam em `AND`; sem filtro → retorna tudo
  - [ ] `ativo` → `returnedAt: null` · `devolvido` → `returnedAt: { not: null }`
  - [ ] `to` inclusivo → `loanedAt: { lt: <dia seguinte 00:00> }`
  - [ ] `include: { book: true, user: true }`
- [ ] `@Get('/loans')` → `[{ id, book, user, loanedAt, status }]`
- [ ] Nenhum resultado → `200` com `[]`
- [ ] `loanedAt` em UTC, filtro chega como `YYYY-MM-DD`

## BIBL-5 — Exportação CSV `5pts`

- [ ] `export.service.ts` — consome `loans.repository.findWithFilters()`
- [ ] Escape: campo com `,`, `"` ou quebra de linha vai entre aspas; aspas internas duplicadas
- [ ] Cabeçalho sempre presente: `livro,usuario,data,situacao`
- [ ] `@Get('/loans/export')` com o mesmo `LoanFilterDto`
- [ ] `Content-Type: text/csv; charset=utf-8`
- [ ] `Content-Disposition: attachment; filename="emprestimos.csv"`
- [ ] Filtro sem resultado → `200` com só o cabeçalho

## Acabamento

- [ ] `Dockerfile` da API + serviço no compose
- [ ] Swagger (`@nestjs/swagger`)
- [ ] Testes dos invariantes do BIBL-2 (limite de 3 · zero cópias · devolução dupla)
- [ ] `GET /books/:id` — declarar depois de `@Get('ranking')`

## Contrato da API

| Método | Rota | Retorno |
|---|---|---|
| `POST` | `/books` | livro criado com `id` |
| `GET` | `/books` | lista com `availableCopies` |
| `GET` | `/books/ranking` | `[{ id, title, author, totalLoans }]` |
| `GET` | `/users` | `[{ id, name }]` |
| `POST` | `/loans` | empréstimo + livro atualizado |
| `PATCH` | `/loans/:id/return` | empréstimo + livro atualizado |
| `GET` | `/loans?userId&from&to&status` | `[{ id, book, user, loanedAt, status }]` |
| `GET` | `/loans/export?<mesmos filtros>` | `text/csv` |

### Erros

```json
{ "statusCode": 409, "message": "Livro sem cópias disponíveis", "error": "Conflict" }
```

| Situação | Status | Exception |
|---|---|---|
| Título vazio, ano futuro, cópias negativa | `400` | `BadRequestException` (via `ValidationPipe`) |
| Livro, usuário ou empréstimo inexistente | `404` | `NotFoundException` |
| Sem cópias disponíveis | `409` | `ConflictException` |
| Limite de 3 empréstimos ativos | `409` | `ConflictException` |
| Devolver empréstimo já devolvido | `409` | `ConflictException` |

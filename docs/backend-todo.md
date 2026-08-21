# Backend TODO — Biblioteca Comunitária (NestJS)

## Decisões

| # | Decisão | Escolha |
|---|---|---|
| 1 | Organização | Feature modules (`src/books/`, `src/loans/`, `src/users/`) |
| 2 | ORM | Prisma — sem pasta `models/`, os tipos são gerados |
| 3 | Execucao | Stack inteira em Docker (db, backend, frontend) com bind mount e hot reload |
| 4 | Cópias | `totalCopies` imutável + `availableCopies` mutável |
| 5 | Situação do empréstimo | Derivada de `returnedAt` (sem campo `status`) |
| 6 | Usuário | Entidade `User` + seed |
| 7 | Período do BIBL-4 | Filtra `loanedAt` |
| 8 | Ranking | Só livros com ≥ 1 empréstimo |
| 9 | Portas | `WEB_PORT`, `API_PORT` e `DB_PORT` no `.env` (defaults 3000/3001/5432) |
| 10 | Validação | DTO + `class-validator` + `ValidationPipe` global |
| 11 | Erros | `HttpException` + Exception Filter |
| 12 | Versao do Prisma | 6.x — a 7 removeu `url` do datasource e exige `prisma.config.ts` |

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

- [x] `nest new backend --package-manager npm`
- [x] `main.ts` — `enableCors` com origem em `CORS_ORIGIN` e `exposedHeaders: ['Content-Disposition']`
- [x] `main.ts` — `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`
- [x] `main.ts` — `app.listen(process.env.PORT ?? 3000)`; o host expoe em `API_PORT`
- [x] `common/filters/http-exception.filter.ts`
  - [x] normalizar `message` para string — o `ValidationPipe` devolve array, `HttpException` devolve string
- [x] `docker-compose.yml` — `db`, `backend` e `frontend`, com volume nomeado no Postgres
- [x] `.env.example` · `.gitignore` · `.dockerignore`
- [x] `npm i prisma@^6 @prisma/client@^6 class-validator class-transformer`
- [x] `prisma/schema.prisma`
- [x] `npx prisma migrate dev --name init`
- [x] `PrismaService extends PrismaClient` + `PrismaModule` global
- [x] `prisma/seed.ts` — 8 livros + 3 leitores, registrado no `package.json`
- [x] `prisma/seed-demo.ts` — acervo + 10 empréstimos cobrindo os casos das histórias
- [x] `nest g resource users` — `@Get('/users')` → `[{ id, name }]` (front escolhe o leitor)

### Comandos

O `node_modules` do backend vive num volume anonimo, entao `npm i` rodado no
host nao chega no container. Instalar dependencia e sempre nesta ordem:

```bash
npm i --package-lock-only <pacote> --prefix backend   # atualiza package.json e lock
docker compose build backend                          # o npm ci da imagem instala
docker compose rm -sfv backend                        # descarta o node_modules antigo
docker compose up -d backend
```

```bash
docker compose up -d                                     # sobe a stack
docker compose exec backend npx prisma migrate dev       # nova migration
docker compose exec backend npm run seed                 # acervo, zero emprestimos
docker compose exec backend npm run seed:demo            # acervo + movimentacao
docker compose exec backend npm test                     # unitarios
docker compose exec backend npm run test:e2e             # e2e (limpa o banco; reseede depois)
docker build --target prod -t biblioteca-backend:prod ./backend   # valida a imagem de producao
docker compose logs -f backend                           # acompanha
```

Se alguma porta estiver ocupada na sua maquina, ajuste `WEB_PORT`, `API_PORT`
ou `DB_PORT` no `.env` — `CORS_ORIGIN` e `NEXT_PUBLIC_API_URL` acompanham.

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

- [x] `nest g resource books`
- [x] `dto/create-book.dto.ts`
  - [x] `title` — `@IsString() @IsNotEmpty()` + `@Transform` com `trim()`
  - [x] `author` — `@IsString() @IsNotEmpty()`
  - [x] `publicationYear` — `@IsNotFutureYear()`, validator proprio que le o ano a cada chamada
  - [x] `copies` — `@IsInt() @Min(0)` (0 é válido, só negativo é recusado)
  - [x] mensagens em portugues, uma por constraint (o front renderiza `message` direto)
- [x] `books.repository.ts` — `create`, `findAll`
- [x] `books.service.ts` — no create, `totalCopies = availableCopies = copies`
- [x] `@Post()` retorna o livro criado com `id`
- [x] `@Get()` retorna a lista com `availableCopies`
- [x] testes unitarios do service + e2e cobrindo os 3 criterios de recusa

## BIBL-2 — Empréstimo e devolução `5pts`

- [x] `nest g resource loans`
- [x] `dto/create-loan.dto.ts` — `bookId`, `userId`
- [x] `loans.repository.ts` — `create`, `countActiveByUser`, `markReturned`, `findById`, `findByIdWithRelations`
- [x] `loans.service.ts` — `create` dentro de `prisma.$transaction`:

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

  - Livro inexistente cai no mesmo `409` acima (a `updateMany` não distingue "não existe" de "sem cópia"). FK de usuário inexistente é capturada (`P2003`) e vira `404`.
- [x] `return` também em transação — `returnedAt = now()` + `increment: 1`
- [x] Devolver empréstimo já devolvido → `ConflictException`
- [x] Devolver empréstimo inexistente → `NotFoundException`
- [x] `@Post('/loans')` e `@Patch('/loans/:id/return')` retornam o empréstimo com `book`/`user` atualizados e `status` derivado
- [x] `loans.repository.ts` — `findAll()` com `include: { book: true, user: true }`
- [x] `@Get('/loans')` sem filtro — o front precisa dela já no BIBL-2 pro botão "Devolver"
- [x] testes unitários dos invariantes (limite de 3 · zero cópias · devolução dupla · usuário inexistente) — `loans.service.spec.ts`

## BIBL-3 — Ranking `3pts`

- [x] `books.repository.ts` — `countLoansByBook()` via `prisma.loan.groupBy`
  - [x] agrupa por `bookId`, conta ativos + devolvidos
  - [x] ordena por contagem desc
  - [x] hidrata título e autor no service
- [x] `@Get('/books/ranking')` → `[{ id, title, author, totalLoans }]`
- [x] Nenhum empréstimo registrado → `200` com `[]` (acervo pode estar cheio)
- [x] Livros nunca emprestados ficam de fora (decisão 8)
- [x] testes unitarios do ranking + e2e com empréstimos ativos e devolvidos

## BIBL-4 — Relatório `5pts`

- [ ] `dto/loan-filter.dto.ts` — todos `@IsOptional()`
  - [ ] `userId` — `@Type(() => Number)`, query param chega como string
  - [ ] `from` / `to` — `@IsDateString()`
  - [ ] `status` — `@IsIn(['ativo', 'devolvido'])`
- [ ] `loans.repository.ts` — `findWithFilters(filtro)` substitui o `findAll()` do BIBL-2 (BIBL-5 reusa)
  - [ ] filtros combinam em `AND`; sem filtro → retorna tudo
  - [ ] `ativo` → `returnedAt: null` · `devolvido` → `returnedAt: { not: null }`
  - [ ] `to` inclusivo → `loanedAt: { lt: <dia seguinte 00:00> }`
  - [ ] `include: { book: true, user: true }`
- [ ] `@Get('/loans')` — adiciona os filtros à rota criada no BIBL-2
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

- [x] `Dockerfile` da API + serviço no compose
  - [x] stage `build` roda `prisma generate` antes do `tsc` e de novo depois do `prune`
  - [x] `prisma/` fora do `tsconfig.build.json`, senão a saída vira `dist/src/main.js`
  - [x] imagem `prod` validada rodando de verdade contra o banco
- [x] Swagger (`@nestjs/swagger`) em `/docs`, com plugin de CLI inferindo os schemas
- [x] Testes dos invariantes do BIBL-2 (limite de 3 · zero cópias · devolução dupla)
  - [x] unitários no service e e2e contra o banco, exercitando a transação
- [x] `GET /books/:id` — declarado depois de `@Get('ranking')`
- [x] Mensagens de validação em português também nos DTOs de empréstimo

## Contrato da API

| Método | Rota | Retorno | Status |
|---|---|---|---|
| `POST` | `/books` | livro criado com `id` | ✅ |
| `GET` | `/books` | lista com `availableCopies` | ✅ |
| `GET` | `/books/ranking` | `[{ id, title, author, totalLoans }]` | ✅ |
| `GET` | `/users` | `[{ id, name }]` | ✅ |
| `POST` | `/loans` | `{ id, book, user, loanedAt, returnedAt, status }` (loan achatado, `book`/`user` já atualizados) | ✅ |
| `PATCH` | `/loans/:id/return` | mesmo formato do `POST /loans`, com `returnedAt` preenchido e `status: "devolvido"` | ✅ |
| `GET` | `/loans` | `[{ id, book, user, loanedAt, returnedAt, status }]` — **sem filtros ainda** | ✅ (filtros `userId`/`from`/`to`/`status` ficam pro BIBL-4) |
| `GET` | `/loans/export?<mesmos filtros>` | `text/csv` | ⬜ BIBL-5 |

`status` é sempre `"ativo"` ou `"devolvido"`, derivado de `returnedAt` (decisão #5).

### Erros

```json
{ "statusCode": 409, "message": "Livro sem cópias disponíveis", "error": "Conflict" }
```

`message` é sempre string — o Exception Filter normaliza o array que o `ValidationPipe` devolve.

| Situação | Status | Exception |
|---|---|---|
| Título vazio, ano futuro, cópias negativa | `400` | `BadRequestException` (via `ValidationPipe`) |
| Usuário inexistente ao emprestar | `404` | `NotFoundException` (violação de FK capturada, `P2003`) |
| Empréstimo inexistente ao devolver | `404` | `NotFoundException` |
| Livro inexistente **ou** sem cópias disponíveis ao emprestar | `409` | `ConflictException` — `updateMany` não distingue as duas causas, então livro inexistente cai no mesmo erro de "sem cópia" |
| Limite de 3 empréstimos ativos | `409` | `ConflictException` |
| Devolver empréstimo já devolvido | `409` | `ConflictException` |

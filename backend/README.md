# Backend — Biblioteca Comunitária

API REST em **NestJS** para o desafio Biblioteca Comunitária: cadastro de livros, controle de empréstimos/devoluções, ranking de mais emprestados e relatório exportável em CSV.

Decisões de arquitetura, contrato de API e checklist completo por história estão em [`../docs/backend-todo.md`](../docs/backend-todo.md). Este README é o guia prático de como rodar, testar e usar a API.

## Stack

- **NestJS** + TypeScript
- **Prisma 6** como ORM (sem pasta `models/`, os tipos são gerados a partir do `schema.prisma`)
- **PostgreSQL 16**
- Validação com `class-validator`/`class-transformer` + `ValidationPipe` global
- Erros padronizados via `HttpExceptionFilter`

## Funcionalidades implementadas

| História | Descrição | Status |
|---|---|---|
| BIBL-1 | Cadastro e listagem de livros | ✅ |
| BIBL-2 | Empréstimo e devolução (limite de 3 ativos por leitor, controle de cópias) | ✅ |
| BIBL-3 | Ranking dos livros mais emprestados | ✅ |
| BIBL-4 | Relatório de empréstimos com filtros (leitor, período, situação) | ✅ |
| BIBL-5 | Exportação do relatório em CSV | ✅ |

## Como rodar

O jeito recomendado é via Docker Compose, orquestrado a partir da raiz do monorepo — veja o [README raiz](../README.md) para o passo a passo completo (`docker compose up -d`, portas, variáveis de ambiente).

### Sem Docker (rodando direto no host)

Precisa de um Postgres acessível (pode ser o do `docker compose up -d db` da raiz, exposto em `localhost:5432`).

```bash
npm install
cp .env.example .env        # ajuste DATABASE_URL se necessário
npx prisma migrate deploy   # aplica a migration existente
npm run seed                # acervo sem empréstimos
# ou
npm run seed:demo           # acervo + ~10 empréstimos cobrindo os cenários das histórias
npm run start:dev           # API em http://localhost:3001 (ou PORT do .env)
```

## Scripts disponíveis

```bash
npm run start:dev    # modo watch (hot reload)
npm run build         # build de produção
npm run start:prod    # roda o build

npm run lint           # eslint --fix
npm run format         # prettier

npm test               # testes unitários
npm run test:e2e       # testes e2e (usa o banco configurado em DATABASE_URL — reseed depois)
npm run test:cov       # cobertura

npm run seed            # popula livros + leitores, acervo sem empréstimos
npm run seed:demo       # popula livros + leitores + ~10 empréstimos (ativos e devolvidos)
```

## Estrutura

```text
backend/
├── prisma/
│   ├── schema.prisma        # models Book, User, Loan
│   ├── seed.ts               # acervo sem empréstimos
│   ├── seed-catalog.ts       # dados-base reaproveitados pelos dois seeds
│   └── seed-demo.ts          # acervo + movimentação cobrindo os critérios de aceite
└── src/
    ├── main.ts                bootstrap, CORS, porta
    ├── app.module.ts           módulos raiz
    ├── app.setup.ts            ValidationPipe + HttpExceptionFilter (compartilhado com testes e2e)
    ├── prisma/                 PrismaService (extends PrismaClient) + PrismaModule global
    ├── common/
    │   ├── filters/            HttpExceptionFilter — normaliza toda resposta de erro
    │   └── validators/         @IsNotFutureYear (validador custom do BIBL-1)
    ├── books/                  módulo · controller · service · repository · dto/
    ├── loans/                  módulo · controller · service · repository · export.service · mapper · dto/
    └── users/                  módulo · controller · service
```

## Contrato da API

| Método | Rota | Retorno |
|---|---|---|
| `POST` | `/books` | livro criado, com `id` e `availableCopies` |
| `GET` | `/books` | lista de livros |
| `GET` | `/books/ranking` | `[{ id, title, author, totalLoans }]`, ordenado por total desc |
| `GET` | `/users` | `[{ id, name }]` — alimenta o seletor de leitor |
| `POST` | `/loans` | `{ id, book, user, loanedAt, returnedAt, status }` |
| `PATCH` | `/loans/:id/return` | mesmo formato do `POST`, com `returnedAt` preenchido |
| `GET` | `/loans?userId=&from=&to=&status=` | lista de empréstimos, todos os filtros opcionais e combináveis |
| `GET` | `/loans/export?<mesmos filtros>` | CSV (`livro,usuario,data,situacao`) |

`status` é sempre `"ativo"` ou `"devolvido"`, derivado de `returnedAt` — não existe coluna `status` no banco. Filtros de `GET /loans` chegam como query string (`from`/`to` no formato `YYYY-MM-DD`, `to` inclusivo).

### Erros

Toda resposta de erro segue o mesmo formato:

```json
{ "statusCode": 409, "message": "Livro sem cópias disponíveis", "error": "Conflict" }
```

`message` é sempre string — o `HttpExceptionFilter` achata o array que o `ValidationPipe` devolve em validações com múltiplos campos inválidos.

| Situação | Status |
|---|---|
| Título vazio, ano no futuro, cópias negativas | `400` |
| Usuário inexistente ao emprestar / empréstimo inexistente ao devolver | `404` |
| Livro inexistente ou sem cópias disponíveis ao emprestar | `409` |
| Limite de 3 empréstimos ativos atingido | `409` |
| Devolver um empréstimo já devolvido | `409` |

Detalhe completo (por que cada exceção é lançada, decisões de schema, etc.) está no [`backend-todo.md`](../docs/backend-todo.md).

## Testes

- **Unitários**: invariantes de negócio de `books` e `loans` (ex.: limite de 3 empréstimos ativos, sem cópia disponível, devolução dupla, usuário inexistente).
- **E2E** (`test/books.e2e-spec.ts`): sobe a aplicação real com o mesmo pipeline de validação/erro do `main.ts` (via `app.setup.ts`) contra o banco configurado em `DATABASE_URL`.

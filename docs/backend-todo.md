# Backend TODO — Biblioteca Comunitária

Organizado seguindo a estrutura de pastas definida em `estruturas_projeto_next_node_fastapi.md` (routes → controllers → schemas → services → repositories → models).

## Base
- [ ] `models`: Book, Loan
- [ ] `repositories`: book.repository, loan.repository
- [ ] `middlewares`: tratamento de erros
- [ ] `main.ts` — bootstrap da aplicação

### Docker
- [ ] `Dockerfile` da API (Node)
- [ ] `docker-compose` com serviço da API + banco (PostgreSQL)
- [ ] Volume para persistir dados do banco
- [ ] `.env.example` com `DATABASE_URL`
- [ ] `.dockerignore` (node_modules, .env, .git)

## BIBL-1 — Cadastro e listagem de livros
- [ ] `schemas/book.schema` — título obrigatório, ano não pode ser futuro, cópias não pode ser negativo
- [ ] `repositories/book.repository` — create, findAll
- [ ] `services/book.service` — regras de criação
- [ ] `controllers/book.controller` — retorna o livro criado na resposta (front lista sem recarregar)
- [ ] `routes/book.routes` — `POST /books`, `GET /books`

## BIBL-2 — Empréstimo e devolução
- [ ] `schemas/loan.schema`
- [ ] `repositories/loan.repository` — create, findActiveByUser, markReturned
- [ ] `services/loan.service` — baixa/repõe cópia disponível, bloqueia com 0 cópias, bloqueia usuário com 3 empréstimos ativos
- [ ] `controllers/loan.controller`
- [ ] `routes/loan.routes` — `POST /loans`, `POST /loans/:id/return`

## BIBL-3 — Ranking de mais emprestados
- [ ] `repositories/book.repository` — findRanking (agregação por total de empréstimos)
- [ ] `services/book.service` — monta ranking, trata acervo vazio sem erro
- [ ] `controllers/book.controller` + `routes/book.routes` — `GET /books/ranking`

## BIBL-4 — Relatório de empréstimos
- [ ] `repositories/loan.repository` — findWithFilters (user, startDate, endDate, status)
- [ ] `services/loan.service` — combina filtros, trata lista vazia sem erro
- [ ] `controllers/loan.controller` + `routes/loan.routes` — `GET /loans`

## BIBL-5 — Exportação CSV
- [ ] `services/export.service` — gera CSV a partir do mesmo filtro do relatório (livro, usuário, data, situação)
- [ ] CSV sempre com linha de cabeçalho identificando as colunas
- [ ] Filtro sem resultado gera arquivo só com cabeçalho, sem erro
- [ ] `controllers/loan.controller` + `routes/loan.routes` — `GET /loans/export`

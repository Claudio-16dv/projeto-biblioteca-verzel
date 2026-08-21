# Frontend TODO — Biblioteca Comunitária (Next.js)

## Decisões

| #   | Decisão         | Escolha                                                                             |
| --- | --------------- | ----------------------------------------------------------------------------------- |
| 1   | Organização     | `components/ui/` (primitivos) + `components/books/` e `components/loans/` (domínio) |
| 2   | Comunicação     | `services/*.service.ts`, hoje devolve mock, depois `fetch`                          |
| 3   | Base URL        | `NEXT_PUBLIC_API_URL=http://localhost:3001`                                         |
| 4   | Estado          | `useState` local + refetch após mutação (sem lib de cache)                          |
| 5   | Renderização    | Client Components, tudo depende de interação e refetch                              |
| 6   | Validação       | No cliente para feedback imediato; o servidor é a garantia real                     |
| 7   | Erros           | Ler `message` do corpo da resposta e renderizar na tela                             |
| 8   | Leitor          | Select alimentado por `GET /users`, sem auth, front escolhe                         |
| 9   | Formato de data | `toLocaleDateString('pt-BR')` na exibição                                           |

## Estrutura

```text
apps/web/src/
├── app/
│   ├── page.tsx              # acervo (BIBL-1 + BIBL-2)
│   ├── ranking/page.tsx      # BIBL-3
│   └── relatorios/page.tsx   # BIBL-4 + BIBL-5
├── components/
│   ├── ui/                   # Button · Input · Select · EmptyState · ErrorMessage
│   ├── books/                # BookCard · BookList · BookForm
│   └── loans/                # LoanTable · LoanFilters
├── services/                 # book.service.ts · loan.service.ts · user.service.ts
├── types/                    # book.ts · loan.ts · user.ts
└── lib/                      # api.ts (fetch wrapper + tratamento de erro)
```

## Fase 0 — Base

- [ ] `.env.local` com `NEXT_PUBLIC_API_URL=http://localhost:3001`
- [ ] `types/book.ts` · `types/loan.ts` · `types/user.ts` conforme o contrato
- [ ] `lib/api.ts`, wrapper de `fetch` que lança erro com a `message` do corpo
- [ ] `components/ui/EmptyState.tsx`, reusado em BIBL-1, BIBL-3 e BIBL-4
- [ ] `components/ui/ErrorMessage.tsx`
- [ ] `data/mock-books.ts` com 4 livros, um deles com `availableCopies: 0`

### Tipos

```ts
type Book = {
  id: number;
  title: string;
  author: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
};

type User = { id: number; name: string };

type Loan = {
  id: number;
  book: Book;
  user: User;
  loanedAt: string;
  status: "ativo" | "devolvido";
};

type ApiError = { statusCode: number; message: string; error: string };
```

## BIBL-1 — Cadastro e listagem 

- [ ] `book.service.ts` com `listBooks()` e `createBook(dto)`
- [ ] `BookCard` exibindo título, autor, ano de publicação e cópias disponíveis
- [ ] `BookList` consumindo o mock, trocado por `listBooks()` quando a rota subir
- [ ] Estado vazio: "Nenhum livro cadastrado"
- [ ] Estado de loading durante o carregamento
- [ ] `BookForm` com `title`, `author`, `publicationYear`, `copies`
  - [ ] título vazio gera erro renderizado na tela
  - [ ] ano no futuro gera erro renderizado na tela
  - [ ] cópias negativas geram erro renderizado na tela
  - [ ] `copies: 0` é válido, não bloquear
- [ ] Após o cadastro, a lista atualiza sem recarregar a página
- [ ] Erro `400` vindo do servidor também é renderizado na tela

## BIBL-2 — Empréstimo e devolução 

- [ ] `user.service.ts` com `listUsers()`
- [ ] Select de leitor alimentado por `GET /users`
- [ ] `loan.service.ts` com `createLoan(bookId, userId)` e `returnLoan(loanId)` via `PATCH`
- [ ] Botão "Emprestar" desabilitado quando `availableCopies === 0`
- [ ] `availableCopies` atualiza na tela após emprestar
- [ ] Lista de empréstimos ativos com botão "Devolver"
- [ ] `availableCopies` atualiza na tela após devolver
- [ ] Erro `409` "Livro sem cópias disponíveis" renderizado na tela
- [ ] Erro `409` "Limite de 3 empréstimos ativos atingido" renderizado na tela

## BIBL-3 — Ranking 

- [ ] `book.service.ts` com `getRanking()`
- [ ] Lista ordenada por `totalLoans` desc, com o total visível em cada item
- [ ] Nenhum empréstimo registrado gera `EmptyState`, sem erro

## BIBL-4 — Relatório 

- [ ] `loan.service.ts` com `listLoans(filtros)` montando os query params
- [ ] `LoanTable` com livro, usuário, data e situação
- [ ] `LoanFilters` com select de usuário, período (`from` / `to`) e select de situação
- [ ] Filtros combinam entre si e refletem na tabela
- [ ] Nenhum resultado gera `EmptyState`, sem erro
- [ ] Datas enviadas como `YYYY-MM-DD`

## BIBL-5 — Exportação CSV 

- [ ] Botão "Exportar CSV" na tela de relatório
- [ ] Chama `/loans/export` com os mesmos filtros aplicados na tabela
- [ ] Download disparado via `Blob` + `URL.createObjectURL`
- [ ] Nome do arquivo lido de `Content-Disposition`, com fallback `emprestimos.csv`
- [ ] Exportar sem resultados não quebra a tela

## Acabamento

- [ ] Navegação entre acervo, ranking e relatórios
- [ ] Estado de loading em toda ação assíncrona
- [ ] Botões desabilitados enquanto a requisição está em voo
- [ ] Responsividade básica

## Convenções

- Mensagens de erro sempre renderizadas na tela, nunca `console.log` ou `alert`
- Trabalhar contra o contrato, não contra a implementação: mock primeiro, `fetch` depois
- Uma branch por responsabilidade, sem sobreposição de arquivos entre os devs de frontend
- Componentes de domínio em `books/` e `loans/`, primitivos em `ui/`

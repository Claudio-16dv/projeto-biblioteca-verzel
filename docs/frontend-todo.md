# TODO — Frontend

Checklist derivado dos critérios de aceite das histórias BIBL-1 e BIBL-2.
Cada item marcado só fecha quando o critério correspondente é validado na tela.

## Contrato da API

Acordadar com o time de backend antes do início do desenvolvimento:

```

```
type Book = {
  id: string
  title: string
  author: string
  year: number
  totalCopies: number
  availableCopies: number
}
```

---

## BIBL-1 — Cadastro e listagem de livros

### Fundação

- [ ] Alinhar o shape do retorno com o backend e escrever `src/types/book.ts`
- [ ] Criar `src/data/mock-books.ts` com 4–5 livros, incluindo um com `availableCopies: 0`

### Listagem

- [ ] Componente `BookCard` — título, autor, ano, cópias disponíveis
- [ ] Tela de listagem consumindo o mock
- [ ] Estado vazio tratado: "Nenhum livro cadastrado"
- [ ] Estado de loading durante o carregamento

### Cadastro

- [ ] Formulário de cadastro — título, autor, ano, cópias
- [ ] Erro renderizado na tela: título vazio
- [ ] Erro renderizado na tela: ano no futuro
- [ ] Erro renderizado na tela: cópias negativas
- [ ] Após o cadastro, a lista atualiza sem recarregar a página

### Integração

- [ ] Trocar o mock por `fetch` quando a rota subir

---

## BIBL-2 — Empréstimo e devolução

- [ ] Botão "Emprestar" desabilitado quando `availableCopies === 0`
- [ ] Botão "Devolver" disponível nos empréstimos ativos
- [ ] Cópias disponíveis atualizam na tela após emprestar ou devolver
- [ ] Renderizar erro vindo do backend: sem cópia disponível
- [ ] Renderizar erro vindo do backend: limite de 3 empréstimos ativos

---

## Convenções

- Mensagens de erro sempre renderizadas na tela — nunca `console.log` ou `alert`
- Validação no cliente é feedback imediato; a garantia real é a validação no servidor
- Trabalhar contra o contrato da API, não contra a implementação — mock primeiro, `fetch` depois
- Uma branch por responsabilidade, sem sobreposição de arquivos entre os devs de frontend
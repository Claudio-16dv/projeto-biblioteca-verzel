# Estruturas de Projeto — Next.js, Node.js e FastAPI

Referência rápida de organização de pastas para projetos pequenos e médios, com foco em clareza, separação de responsabilidades e facilidade de manutenção.

---

## 1. Frontend — Next.js

```text
src/
├── app/                    # Rotas, páginas e layouts
│   ├── layout.tsx
│   ├── page.tsx
│   └── users/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
│
├── components/             # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Header.tsx
│   └── UserCard.tsx
│
├── services/               # Comunicação com APIs/backend
│   └── user.service.ts
│
├── hooks/                  # Hooks reutilizáveis
│   └── useUsers.ts
│
├── schemas/                # Validação de formulários e dados
│   └── user.schema.ts
│
├── types/                  # Tipos e interfaces TypeScript
│   └── user.ts
│
├── lib/                    # Configurações de bibliotecas e clientes
│   └── api.ts
│
└── utils/                  # Funções auxiliares e reutilizáveis
    └── formatDate.ts
```

---

## 2. Backend — Node.js

```text
src/
├── routes/         # Define os endpoints e direciona para os controllers
├── controllers/    # Recebe a requisição, usa o schema e devolve a resposta
├── schemas/        # Valida e transforma os dados de entrada
├── services/       # Contém as regras de negócio
├── repositories/   # Consulta, salva, atualiza e remove dados no banco
├── models/         # Representa as entidades e estruturas de dados
├── middlewares/    # Executa autenticação, logs e tratamento de erros
├── utils/          # Funções auxiliares e reutilizáveis
├── types/          # Tipos e interfaces compartilhados
└── main.ts         # Inicializa a aplicação
```

# Arquitetura Geral

```text
              FRONTEND
               Next.js
                  │
                  │ HTTP / REST
                  ▼
               BACKEND
               Node.js
                  │
          ┌───────┴────────┐
          ▼                ▼
       Services       Repositories
                           │
                           ▼
                        Database
```

## Stack sugerida para um desafio curto

```text
Frontend
Next.js
React
TypeScript

      ↓ HTTP / REST

Backend
Node  ↓

Database
PostgreSQL
```

Para um projeto muito pequeno ou protótipo:

```text
Next.js
   ↓
Node.js
   ↓
PostgreSQL
```

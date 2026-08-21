# projeto-biblioteca-verzel

Monorepo com **frontend** em Next.js (TypeScript) e **backend** em NestJS, com banco **PostgreSQL**, orquestrados via Docker Compose.

## Stack

- **Frontend:** Next.js 16 + React + TypeScript + Tailwind CSS
- **Backend:** NestJS + TypeScript
- **Banco:** PostgreSQL 16
- **Orquestracao:** Docker + Docker Compose

## Estrutura

```text
projeto-biblioteca-verzel/
├── docker-compose.yml      # Orquestra db + backend + frontend
├── .env                    # Variaveis do ambiente (nao versionado)
├── .env.example            # Modelo das variaveis
├── backend/                # API NestJS (host 3001)
│   └── Dockerfile
└── frontend/               # App Next.js (host 3000)
    └── Dockerfile
```

## Pre-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e **em execucao**
- Docker Compose v2+ (ja incluso no Docker Desktop)

## Como executar com Docker

1. Crie o arquivo `.env` a partir do modelo (caso ainda nao exista):

   ```powershell
   Copy-Item .env.example .env
   ```

2. Suba todos os containers (build na primeira vez):

   ```powershell
   docker compose up --build -d
   ```

3. Acesse os servicos:

   | Servico   | URL                     |
   | --------- | ----------------------- |
   | Frontend  | http://localhost:3000   |
   | Backend   | http://localhost:3001   |
   | Postgres  | localhost:5432          |

4. Acompanhe os logs (opcional):

   ```powershell
   docker compose logs -f
   ```

O codigo de `backend/` e `frontend/` e montado nos containers em modo desenvolvimento, entao alteracoes nos arquivos recarregam automaticamente (hot reload).

## Comandos uteis

```powershell
# Parar os containers (mantem os dados do banco)
docker compose down

# Parar e apagar tambem o volume do banco (reset total)
docker compose down -v

# Rebuildar apenas um servico
docker compose build backend
docker compose build frontend

# Ver o status dos containers
docker compose ps

# Logs de um servico especifico
docker compose logs -f backend
```

## Variaveis de ambiente

Definidas no `.env` (usado pelo Docker Compose):

| Variavel            | Padrao        | Descricao                          |
| ------------------- | ------------- | ---------------------------------- |
| `POSTGRES_USER`     | `biblioteca`  | Usuario do PostgreSQL              |
| `POSTGRES_PASSWORD` | `biblioteca`  | Senha do PostgreSQL                |
| `POSTGRES_DB`       | `biblioteca`  | Nome do banco                      |
| `DB_PORT`           | `5432`        | Porta do Postgres exposta no host  |

O backend recebe automaticamente:

- `PORT=3000` (porta padrao do Nest dentro do container; exposto como 3001 no host)
- `CORS_ORIGIN=http://localhost:3000` (origem liberada no CORS = frontend)
- `DATABASE_URL=postgresql://<user>:<pass>@db:5432/<db>`

O frontend recebe:

- `NEXT_PUBLIC_API_URL=http://localhost:3001`

## Solucao de problemas

**O daemon do Docker retorna erro (500 / cannot connect):**
Abra o Docker Desktop e aguarde ele ficar "running". Confirme com `docker info` (nao pode retornar erro) antes de rodar o compose.

**Erro de certificado no build (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`):**
Comum em redes corporativas com inspecao TLS. Rebuilde desabilitando a verificacao SSL apenas durante o build:

```powershell
docker compose build --build-arg NPM_STRICT_SSL=false
docker compose up -d
```

**Porta ja em uso:**
Altere o mapeamento no `docker-compose.yml` (lado esquerdo do `host:container`) ou pare o processo que esta usando a porta.

## Rodando sem Docker (opcional)

```powershell
# Backend (porta 3001)
cd backend; npm install; $env:PORT=3001; npm run start:dev

# Frontend (porta 3000) - em outro terminal
cd frontend; npm install; npm run dev
```

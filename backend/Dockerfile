# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

# ---- Base ----
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# ---- Dependencies (inclui devDependencies) ----
FROM base AS deps
# Escape hatch para redes corporativas com inspecao TLS (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
# Mantenha "true" por padrao. Se o build falhar por certificado, use --build-arg NPM_STRICT_SSL=false.
ARG NPM_STRICT_SSL=true
COPY package*.json ./
RUN npm config set strict-ssl ${NPM_STRICT_SSL} && npm ci

# ---- Development (hot reload) ----
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ---- Build ----
FROM base AS build
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

# ---- Production ----
FROM node:${NODE_VERSION} AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/main"]

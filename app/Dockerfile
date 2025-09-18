# ---------- Stage 1: build ----------
FROM node:20-slim AS builder

# 1) diretório de trabalho
WORKDIR /app

# 2) dependências primeiro (melhor cache)
COPY package.json package-lock.json ./
# se houver package-lock.json, use npm ci para builds reprodutíveis
RUN npm ci

# 3) copiar o restante do projeto
COPY . .

# 4) desliga telemetria e faz o build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 5) remove devDeps para reduzir tamanho
RUN npm prune --omit=dev


# ---------- Stage 2: runtime ----------
FROM node:20-slim AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# 1) arquivos mínimos para rodar
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# se você tiver next.config.(js|mjs|ts), copie também:
COPY --from=builder /app/next.config.* ./ || true

# 2) porta padrão do Next
EXPOSE 3000

# 3) por segurança, rode como usuário não-root
USER node

# 4) comando de inicialização
CMD ["npm", "run", "start"]


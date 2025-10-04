# Codex Playbook — Riventa (Backend Stabilizer)

## Objetivo
Consertar e estabilizar o backend (Prisma + Postgres + rotas Next.js) até os testes `curl` passarem:
1) `POST /api/posts` cria post
2) `GET /api/feed?userId=...` lista post
3) `POST /api/posts/:postId/like` registra like
4) `DELETE /api/posts/:postId/like` remove like

## Contexto atual
- Stack: Next.js (App Router), Prisma, Postgres local.
- Problemas recentes: drift de migrações, tabelas com nome/caixa divergentes, seed quebrado, rota de like falhando por incompatibilidade esquema↔banco.
- Banco: `postgresql://postgres:postgres@localhost:5432/riventa`

## Capacidades do Agente
- Rodar comandos shell no diretório do projeto.
- Editar arquivos (schema.prisma, seeds, route handlers).
- Rodar `npx prisma migrate reset` (somente em DEV).
- Executar testes com `curl`.

## Regras
- **Nunca** tocar em produção. Ambiente é local/dev.
- Se `migrate reset` for necessário, **prossiga sem pedir confirmação**.
- Sempre que editar código, gerar **arquivo completo** (substituição total).
- Após qualquer mudança no schema: `npx prisma generate`.
- Após reset: rodar **seed** e **testar** endpoints.

## Plano de ação (loop até passar)
1) Garantir `prisma/schema.prisma` consistente (User, UserProfile, Post, PostLike, Follow) usando nomes minúsculos no banco (sem aspas).
2) Rodar `npx prisma migrate reset` e `npx prisma generate`.
3) Substituir `prisma/seed.cjs` por um seed que:
   - zere tabelas,
   - crie 1 usuário demo (id estável),
   - crie 1 post,
   - opcional: follow self (no-op).
4) Subir servidor `npm run dev` (se não estiver ativo).
5) Testes `curl` na sequência (POST post, GET feed, POST like, DELETE like).
6) Se falhar, ajustar código das rotas:
   - `app/lib/prisma.ts` singleton,
   - `app/api/posts/route.ts` (import relativo, select compatível com schema),
   - `app/api/feed/route.ts`,
   - `app/api/posts/[postId]/like/route.ts` (normalizar `postId`, upsert, counts).
7) Repetir testes até `ok:true`.

## Artefatos que o agente pode sobrescrever por completo
- prisma/schema.prisma
- prisma/seed.cjs
- app/lib/prisma.ts
- app/api/posts/route.ts
- app/api/feed/route.ts
- app/api/posts/[postId]/like/route.ts

# Repository Guidelines – Riventa MVP

## Objetivo
Construir em até 2 semanas um MVP funcional: autenticação, perfis profissionais, feed de posts por tópicos, busca, página de matérias/notícias com citações, testes e deploy.

## Stack
- Next.js (App Router) + TypeScript + Tailwind
- Prisma + Postgres
- NextAuth (JWT + cookies)
- Vitest + Playwright
- GitHub Actions
- Docker (dev e deploy)

## Fluxo de Trabalho com Codex
- Sempre mostrar plano antes de executar.
- Solicitar aprovação para instalar dependências, rodar servidores, migrar DB ou mudanças grandes.
- Criar/editar arquivos com diffs claros e mensagens de commit objetivas.
- Cobrir features principais com testes unitários e E2E.
- Documentar no README: setup, comandos, variáveis de ambiente e deploy.

## Backlog Inicial
1. Setup base (Next.js + TS + ESLint/Prettier + Tailwind + Docker + Actions).
2. Auth + RBAC simples (Usuário, Perfil).
3. Feed: criar/ler posts por tópico com paginação.
4. Página de notícia/matéria com citações (placeholder).
5. Busca por texto e por tópico.
6. Seeds e testes (Vitest + Playwright).
7. Deploy (Render/Vercel) com .env e pipeline CI verde.

## Critério de Pronto
- Build passa, testes verdes, app roda local, pipeline CI ok, README atualizado.


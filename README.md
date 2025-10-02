This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Linting & Formatting

- Run `npm run lint` to check ESLint rules alongside Prettier formatting using the default configuration.
- Run `npm run format` to apply Prettier's default formatting to the project files.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Ambiente

- Copie `.env.example` para `.env.local`.
- Configure `OPENAI_API_KEY` com sua chave da OpenAI. `COMMIT_SHA` é definido no `docker run` quando necessário.

## Banco de Dados & Prisma
- Execute `npm install prisma @prisma/client` para preparar o cliente ORM.
- Copie `.env.example` para `.env.local` e ajuste as variáveis se necessário.
- Suba o Postgres local com `npm run db:up` (Docker necessário).
- Gere o cliente com `npm run prisma:generate` e crie o schema inicial com `npm run db:migrate`.
- Visualize os dados com `npm run db:studio`.


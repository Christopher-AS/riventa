import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // só valida conexão e conta quantos registros existem em cada tabela principal
  const [users, posts, comments] = await Promise.all([
    prisma.user.count().catch(() => 0),
    prisma.post.count().catch(() => 0),
    prisma.comment?.count?.().catch?.(() => 0) ?? 0, // protege caso client ainda não tenha comment
  ]);

  console.log({ users, posts, comments });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

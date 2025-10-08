const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { profile: true }
  });
  console.log('Total de usuários:', users.length);
  console.log(JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const count = await prisma.news.count();
    const latest = await prisma.news.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { author: { include: { profile: true } } }
    });

    console.log('Total de notícias no banco:', count);
    console.table(
      latest.map(n => ({
        id: n.id,
        title: n.title,
        autor: n.author.profile?.name || n.author.email
      }))
    );
  } catch (e) {
    console.error('Erro no smoke test:', e);
  } finally {
    await prisma.$disconnect();
  }
})();

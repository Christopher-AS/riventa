const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const user = await prisma.user.upsert({
      where: { email: 'demo@riventa.app' },
      update: {},
      create: {
        email: 'demo@riventa.app',
        name: 'Demo User',
        password: 'demo', // ok para seed; depois trocamos por hash
      },
    });
    console.log('✅ Seed OK. USER_ID=', user.id);
  } catch (e) {
    console.error('❌ Seed error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

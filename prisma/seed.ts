import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando tabelas...');
  
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Tabelas limpas!');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.create({
    data: {
      id: 'bf96eb9a-3e36-42c5-ae75-6dd8b34f7844',
      email: 'alice@demo.com',
      password: hashedPassword,
      profile: {
        create: {
          name: 'Alice Demo',
          bio: 'Usuária de teste do Riventa',
          avatar: 'https://i.pravatar.cc/150?img=1',
        },
      },
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@demo.com',
      password: hashedPassword,
      profile: {
        create: {
          name: 'Bob Silva',
          bio: 'Desenvolvedor e entusiasta de tecnologia',
          avatar: 'https://i.pravatar.cc/150?img=2',
        },
      },
    },
  });

  const carol = await prisma.user.create({
    data: {
      email: 'carol@demo.com',
      password: hashedPassword,
      profile: {
        create: {
          name: 'Carol Santos',
          bio: 'Designer apaixonada por UX',
          avatar: 'https://i.pravatar.cc/150?img=3',
        },
      },
    },
  });

  console.log('✅ Usuários criados:');
  console.log('   - Alice Demo (alice@demo.com)');
  console.log('   - Bob Silva (bob@demo.com)');
  console.log('   - Carol Santos (carol@demo.com)');
  console.log('   Senha: password123');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

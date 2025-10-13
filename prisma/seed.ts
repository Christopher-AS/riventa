import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Conteúdos variados para posts
const postContents = [
  'Bom dia! ☀️',
  'Que dia incrível!',
  'Trabalhando em novos projetos 💻',
  'Café da manhã perfeito ☕',
  'Finalmente sexta-feira! 🎉',
  'Estudando novas tecnologias',
  'Momento de reflexão 🤔',
  'Adorei esse lugar!',
  'Compartilhando conhecimento',
  'Dia produtivo de trabalho',
  'Aprendendo algo novo todos os dias',
  'Gratidão por tudo 🙏',
  'Foco e determinação',
  'Inspiração do dia',
  'Networking é essencial',
  'Inovação e criatividade',
  'Desafios nos fazem crescer',
  'Celebrando pequenas vitórias',
  'Equilíbrio é fundamental',
  'Nunca pare de aprender',
  'Tecnologia transformando vidas',
  'Colaboração é a chave',
  'Pensamento positivo sempre',
  'Construindo o futuro',
  'Momento de descontração',
  'Produtividade em alta',
  'Compartilhando experiências',
  'Evolução constante',
  'Foco nos objetivos',
  'Inspiração e motivação',
];

const commentTexts = [
  'Muito bom!',
  'Adorei! 👏',
  'Excelente post!',
  'Concordo totalmente',
  'Inspirador!',
  'Parabéns!',
  'Top demais!',
  'Sensacional',
  'Que legal!',
  'Incrível',
  'Perfeito!',
  'Amei',
  'Show!',
  'Demais',
  'Ótimo conteúdo',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🧹 Limpando banco de dados...');
  
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Banco limpo!');

  const hashedPassword = await bcrypt.hash('password123', 10);

  console.log('👥 Criando 100 usuários...');
  
  const userIds: string[] = [];

  // Criar 100 usuários
  for (let i = 1; i <= 100; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@test.com`,
        password: hashedPassword,
        profile: {
          create: {
            name: `User ${i}`,
            bio: `Biografia do usuário ${i}`,
            avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
          },
        },
      },
    });
    userIds.push(user.id);
    
    if (i % 20 === 0) {
      console.log(`   ✓ ${i} usuários criados`);
    }
  }

  console.log('✅ 100 usuários criados!');

  console.log('🔗 Criando follows dentro dos grupos...');

  // Criar follows dentro de cada grupo (5 grupos de 20 usuários)
  for (let group = 0; group < 5; group++) {
    const startIdx = group * 20;
    const endIdx = startIdx + 20;
    const groupUserIds = userIds.slice(startIdx, endIdx);

    // Cada usuário do grupo segue todos os outros do mesmo grupo
    for (let i = 0; i < groupUserIds.length; i++) {
      for (let j = 0; j < groupUserIds.length; j++) {
        if (i !== j) {
          await prisma.follow.create({
            data: {
              followerId: groupUserIds[i],
              followingId: groupUserIds[j],
            },
          });
        }
      }
    }

    console.log(`   ✓ Grupo ${group + 1} conectado (users ${startIdx + 1}-${endIdx})`);
  }

  console.log('✅ Follows criados!');

  console.log('📝 Criando posts (100 por usuário)...');

  let totalPosts = 0;
  let imageCounter = 1;

  for (let userIdx = 0; userIdx < userIds.length; userIdx++) {
    const userId = userIds[userIdx];
    const posts = [];

    // Criar 100 posts por usuário
    for (let postNum = 0; postNum < 100; postNum++) {
      const content = randomElement(postContents) + ` #${postNum + 1}`;
      const createdAt = new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000); // últimos 90 dias
      const imageUrl = `https://picsum.photos/800/800?random=${imageCounter}`;
      imageCounter++;

      posts.push({
        content,
        authorId: userId,
        createdAt,
        imageUrl,
      });
    }

    // Inserir posts em batch
    await prisma.post.createMany({
      data: posts,
    });

    totalPosts += posts.length;

    if ((userIdx + 1) % 10 === 0) {
      console.log(`   ✓ ${totalPosts} posts criados (${userIdx + 1}/100 usuários)`);
    }
  }

  console.log('✅ 10,000 posts criados!');

  console.log('❤️ Criando likes aleatórios...');

  // Buscar todos os posts
  const allPosts = await prisma.post.findMany({
    select: { id: true },
  });

  let totalLikes = 0;

  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    const numLikes = randomInt(0, 50);

    if (numLikes > 0) {
      // Selecionar usuários aleatórios para dar like
      const likers = new Set<string>();
      while (likers.size < numLikes && likers.size < userIds.length) {
        likers.add(randomElement(userIds));
      }

      const likes = Array.from(likers).map(userId => ({
        postId: post.id,
        userId,
      }));

      await prisma.like.createMany({
        data: likes,
        skipDuplicates: true,
      });

      totalLikes += likes.length;
    }

    if ((i + 1) % 1000 === 0) {
      console.log(`   ✓ ${totalLikes} likes criados (${i + 1}/10000 posts)`);
    }
  }

  console.log(`✅ ${totalLikes} likes criados!`);

  console.log('💬 Criando comentários aleatórios...');

  let totalComments = 0;

  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    const numComments = randomInt(0, 20);

    if (numComments > 0) {
      const comments = [];

      for (let c = 0; c < numComments; c++) {
        comments.push({
          content: randomElement(commentTexts),
          postId: post.id,
          userId: randomElement(userIds),
          createdAt: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000),
        });
      }

      await prisma.comment.createMany({
        data: comments,
      });

      totalComments += comments.length;
    }

    if ((i + 1) % 1000 === 0) {
      console.log(`   ✓ ${totalComments} comentários criados (${i + 1}/10000 posts)`);
    }
  }

  console.log(`✅ ${totalComments} comentários criados!`);

  console.log('\n🎉 Seed completo!');
  console.log('📊 Resumo:');
  console.log(`   - 100 usuários (user1@test.com até user100@test.com)`);
  console.log(`   - Senha: password123`);
  console.log(`   - 5 grupos de 20 usuários com follows mútuos`);
  console.log(`   - 10,000 posts (100 por usuário)`);
  console.log(`   - ${totalLikes} likes`);
  console.log(`   - ${totalComments} comentários`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

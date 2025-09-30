import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';

// Proteção básica - altere esta chave para algo seguro
const SEED_SECRET = process.env.SEED_SECRET || 'your-secret-key-change-me';

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${SEED_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verificar se já existe dados
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json({
        message: 'Database already seeded',
        existingUsers: userCount
      });
    }

    // Criar usuários de teste
    const hashedPassword = await hash('demo123', 10);

    const alice = await prisma.user.create({
      data: {
        email: 'alice@demo.com',
        name: 'Alice Santos',
        password: hashedPassword,
        emailVerified: new Date(),
        profile: {
          create: {
            bio: 'Desenvolvedora Full Stack apaixonada por tecnologia e inovação'
          }
        }
      }
    });

    const bob = await prisma.user.create({
      data: {
        email: 'bob@demo.com',
        name: 'Bob Silva',
        password: hashedPassword,
        emailVerified: new Date(),
        profile: {
          create: {
            bio: 'Designer UI/UX | Criando experiências incríveis'
          }
        }
      }
    });

    const carol = await prisma.user.create({
      data: {
        email: 'carol@demo.com',
        name: 'Carol Oliveira',
        password: hashedPassword,
        emailVerified: new Date(),
        profile: {
          create: {
            bio: 'Product Manager | Tech enthusiast | Coffee lover'
          }
        }
      }
    });

    // Criar relacionamentos
    await prisma.follow.createMany({
      data: [
        { followerId: alice.id, followingId: bob.id },
        { followerId: alice.id, followingId: carol.id },
        { followerId: bob.id, followingId: alice.id },
        { followerId: carol.id, followingId: alice.id }
      ]
    });

    // Criar posts
    await prisma.post.createMany({
      data: [
        {
          userId: alice.id,
          content: 'Acabei de fazer deploy do Riventa! Próxima social network está no ar!',
          published: true
        },
        {
          userId: bob.id,
          content: 'Novo design system em andamento. Que ferramenta vocês preferem: Figma ou Sketch?',
          published: true
        },
        {
          userId: carol.id,
          content: 'Reflexão do dia: O melhor código é aquele que você não precisa escrever',
          published: true
        },
        {
          userId: alice.id,
          content: 'Estudando Next.js 15 e estou impressionada com o Turbopack! Velocidade absurda',
          published: true
        }
      ]
    });

    // Criar notícias de exemplo
    await prisma.news.createMany({
      data: [
        {
          title: 'Next.js 15 traz melhorias significativas de performance',
          description: 'Nova versão do framework apresenta Turbopack como bundler padrão',
          url: 'https://nextjs.org/blog/next-15',
          imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
          source: 'Vercel Blog',
          category: 'Tecnologia',
          publishedAt: new Date('2024-10-01')
        },
        {
          title: 'O futuro das redes sociais descentralizadas',
          description: 'Plataformas como Mastodon ganham força após mudanças em grandes redes',
          url: 'https://example.com/social-future',
          imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
          source: 'Tech News',
          category: 'Social',
          publishedAt: new Date('2024-09-28')
        },
        {
          title: 'PostgreSQL 17 lançado com novos recursos',
          description: 'Banco de dados open source traz melhorias em performance e segurança',
          url: 'https://www.postgresql.org/about/news/',
          imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
          source: 'PostgreSQL',
          category: 'Banco de Dados',
          publishedAt: new Date('2024-09-25')
        }
      ]
    });

    const stats = {
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      news: await prisma.news.count(),
      follows: await prisma.follow.count()
    };

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      stats
    });

  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Seed failed', details: error.message },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token !== process.env.SEED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash('demo123', 10);
    const now = new Date();

    // Criar usuários
    const alice = await prisma.user.create({
      data: {
        email: 'alice@demo.com',
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
        profile: {
          create: {
            bio: 'Desenvolvedora Full Stack',
            createdAt: now,
            updatedAt: now,
          }
        }
      }
    });

    const bob = await prisma.user.create({
      data: {
        email: 'bob@demo.com',
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
        profile: {
          create: {
            bio: 'Designer UI/UX',
            createdAt: now,
            updatedAt: now,
          }
        }
      }
    });

    const carol = await prisma.user.create({
      data: {
        email: 'carol@demo.com',
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
        profile: {
          create: {
            bio: 'Product Manager',
            createdAt: now,
            updatedAt: now,
          }
        }
      }
    });

    // Criar posts
    await prisma.post.create({
      data: {
        authorId: alice.id,
        content: 'Deploy do Riventa concluído! 🚀',
        createdAt: now,
        updatedAt: now,
      }
    });

    await prisma.post.create({
      data: {
        authorId: bob.id,
        content: 'Trabalhando em novo design para o feed',
        createdAt: now,
        updatedAt: now,
      }
    });

    // Criar relacionamentos
    await prisma.follow.create({
      data: {
        followerId: alice.id,
        followingId: bob.id,
        createdAt: now,
      }
    });

    await prisma.follow.create({
      data: {
        followerId: alice.id,
        followingId: carol.id,
        createdAt: now,
      }
    });

    await prisma.follow.create({
      data: {
        followerId: bob.id,
        followingId: alice.id,
        createdAt: now,
      }
    });

    await prisma.follow.create({
      data: {
        followerId: carol.id,
        followingId: alice.id,
        createdAt: now,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      users: 3,
      posts: 2,
      follows: 4
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      error: 'Seed failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
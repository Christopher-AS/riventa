import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';

const SEED_SECRET = process.env.SEED_SECRET || 'your-secret-key-change-me';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${SEED_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json({ message: 'Database already seeded', existingUsers: userCount });
    }

    const hashedPassword = await hash('demo123', 10);

    const alice = await prisma.user.create({
      data: {
        email: 'alice@demo.com',
        name: 'Alice Santos',
        password: hashedPassword,
        emailVerified: new Date(),
        profile: { create: { bio: 'Desenvolvedora Full Stack' } }
      }
    });

    const bob = await prisma.user.create({
      data: {
        email: 'bob@demo.com',
        name: 'Bob Silva',
        password: hashedPassword,
        emailVerified: new Date(),
        profile: { create: { bio: 'Designer UI/UX' } }
      }
    });

    const carol = await prisma.user.create({
      data: {
        email: 'carol@demo.com',
        name: 'Carol Oliveira',
        password: hashedPassword,
        emailVerified: new Date(),
        profile: { create: { bio: 'Product Manager' } }
      }
    });

    await prisma.follow.createMany({
      data: [
        { followerId: alice.id, followingId: bob.id },
        { followerId: alice.id, followingId: carol.id },
        { followerId: bob.id, followingId: alice.id },
        { followerId: carol.id, followingId: alice.id }
      ]
    });

    await prisma.post.createMany({
      data: [
        { userId: alice.id, content: 'Deploy do Riventa feito!', published: true },
        { userId: bob.id, content: 'Novo design em andamento', published: true },
        { userId: carol.id, content: 'O melhor codigo e o que nao precisa escrever', published: true }
      ]
    });

    const stats = {
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      follows: await prisma.follow.count()
    };

    return NextResponse.json({ success: true, message: 'Database seeded successfully!', stats });
  } catch (error: any) {
    return NextResponse.json({ error: 'Seed failed', details: error.message }, { status: 500 });
  }
}

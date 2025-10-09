import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// POST - Seguir usuário
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário logado
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const userIdToFollow = userId;

    // Não pode seguir a si mesmo
    if (currentUser.id === userIdToFollow) {
      return NextResponse.json({ error: 'Você não pode seguir a si mesmo' }, { status: 400 });
    }

    // Verificar se já segue
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userIdToFollow,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: 'Você já segue este usuário' }, { status: 400 });
    }

    // Criar follow
    const follow = await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: userIdToFollow,
      },
    });

    return NextResponse.json({ success: true, follow }, { status: 201 });
  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    return NextResponse.json({ error: 'Erro ao seguir usuário' }, { status: 500 });
  }
}

// DELETE - Deixar de seguir
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário logado
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const userIdToUnfollow = userId;

    // Deletar follow
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userIdToUnfollow,
        },
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao deixar de seguir:', error);
    return NextResponse.json({ error: 'Erro ao deixar de seguir' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/posts
// Cria um novo post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, userId, imageUrl } = body;

    if (!content?.trim() || !userId) {
      return NextResponse.json(
        { error: 'content e userId são obrigatórios' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        userId,
        imageUrl: imageUrl || null,
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, post });
  } catch (error: any) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar post', detail: error?.message },
      { status: 500 }
    );
  }
}
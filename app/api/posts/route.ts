import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Configuração de runtime
export const runtime = 'nodejs';
export const maxDuration = 10;

// POST /api/posts
// Cria um novo post
export async function POST(req: NextRequest) {
  console.log('🔵 POST /api/posts - INICIOU');
  
  try {
    console.log('🔵 Parseando body...');
    const body = await req.json();
    console.log('🔵 Body parseado:', { content: body.content?.substring(0, 20), authorId: body.authorId });
    
    const { content, authorId, imageUrl } = body;

    if (!content?.trim() || !authorId) {
      console.log('🔴 Validação falhou');
      return NextResponse.json(
        { error: 'content e authorId são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🔵 Tentando criar post no Prisma...');
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId,
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

    console.log('✅ Post criado com sucesso:', post.id);
    return NextResponse.json({ ok: true, post });
  } catch (error: any) {
    console.error('🔴 POST /api/posts error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar post', detail: error?.message },
      { status: 500 }
    );
  }
}

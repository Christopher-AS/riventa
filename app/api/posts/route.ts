import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma'; // <-- corrigido

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { authorId, content } = body ?? {};

    if (!authorId || typeof authorId !== 'string') {
      return NextResponse.json({ error: 'authorId obrigatório' }, { status: 400 });
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'content obrigatório' }, { status: 400 });
    }

    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true, email: true }
    });
    if (!author) {
      return NextResponse.json({ error: 'authorId não encontrado' }, { status: 404 });
    }

    const post = await prisma.post.create({
      data: { authorId, content: content.trim() },
      include: { author: { select: { id: true, email: true } } },
    });

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/posts error:', err?.message ?? err);
    return NextResponse.json({ error: 'Falha ao criar post', detail: String(err?.message ?? err) }, { status: 500 });
  }
}

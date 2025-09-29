// app/api/likes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/likes
 * Body: { newsId: string, userId: string }
 * Alterna like/unlike e retorna o total de likes da notícia.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}) as any);
    const newsId: string | undefined = body.newsId;
    const userId: string | undefined = body.userId;

    if (!newsId || !userId) {
      return NextResponse.json(
        { error: "newsId e userId são obrigatórios" },
        { status: 400 }
      );
    }

    // Se houver like, remove (unlike); se não houver, cria (like).
    const existing = await prisma.like.findUnique({
      where: { userId_newsId: { userId, newsId } }, // precisa do @@unique([userId, newsId]) no schema
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { newsId } });
      return NextResponse.json({ liked: false, count });
    } else {
      await prisma.like.create({
        data: {
          id: crypto.randomUUID(), // id é String @id no seu schema
          // Usamos as relações exigidas pelo LikeCreateInput
          News: { connect: { id: newsId } },
          User: { connect: { id: userId } },
        },
      });

      const count = await prisma.like.count({ where: { newsId } });
      return NextResponse.json({ liked: true, count });
    }
  } catch (error: any) {
    console.error("POST /api/likes erro:", error);
    return NextResponse.json(
      { error: "Erro interno", detail: error?.message ?? null },
      { status: 500 }
    );
  }
}

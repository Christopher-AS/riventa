import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const newsId = searchParams.get("newsId");
    if (!newsId) {
      return NextResponse.json({ error: "newsId é obrigatório" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { newsId },
      include: { author: { include: { profile: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("GET /api/comments erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newsId: string | undefined = body.newsId;
    const userId: string | undefined = body.userId; // vem como userId do cliente
    const content: string | undefined = body.content;

    if (!newsId || !userId || !content?.trim()) {
      return NextResponse.json(
        { error: "newsId, userId e content são obrigatórios" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        newsId,
        authorId: userId,              // <-- mapeia para o campo correto no schema
        content: content.trim(),
      },
      include: { author: { include: { profile: true } } },
    });

    return NextResponse.json(comment);
  } catch (error: any) {
    console.error("POST /api/comments erro:", error);
    return NextResponse.json(
      { error: "Erro interno", detail: error?.message ?? null },
      { status: 500 }
    );
  }
}

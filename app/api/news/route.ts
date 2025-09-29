import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/news
 * Lista notícias (com autor e comentários) em ordem decrescente de criação.
 */
export async function GET() {
  try {
    const items = await prisma.news.findMany({
      include: {
        User: {
          // <- correto, no schema é "User"
          include: { profile: true },
        },
        Comment: {
          // <- correto, no schema é "Comment"
          include: {
            User: { include: { profile: true } },
          },
        },
        Like: true, // <- já existe relação Like[], pode incluir direto
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error("GET /api/news erro:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Erro interno" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/news
 * Cria uma notícia (title, content, userId). O schema deve ter `authorId` em News.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const title: string | undefined = body?.title?.trim();
    const content: string | undefined = body?.content?.trim();
    const userId: string | undefined = body?.userId;

    if (!userId || !title || !content) {
      return NextResponse.json(
        { ok: false, error: "userId, title e content são obrigatórios" },
        { status: 400 }
      );
    }

    const created = await prisma.news.create({
      data: {
        authorId: userId, // <- campo certo no schema
        title,
        content,
      },
      include: {
        User: { include: { profile: true } },
      },
    });

    return NextResponse.json({ ok: true, item: created });
  } catch (err: any) {
    console.error("POST /api/news erro:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Erro interno" },
      { status: 500 }
    );
  }
}

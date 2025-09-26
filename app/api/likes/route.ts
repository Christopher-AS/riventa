import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/likes?newsId=...&userId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const newsId = searchParams.get("newsId");
    const userId = searchParams.get("userId"); // opcional

    if (!newsId) {
      return NextResponse.json({ error: "newsId é obrigatório" }, { status: 400 });
    }

    const count = await prisma.like.count({ where: { newsId } });

    let likedUser = false;
    if (userId) {
      const existing = await prisma.like.findFirst({
        where: { newsId, userId },
        select: { id: true },
      });
      likedUser = Boolean(existing);
    }

    return NextResponse.json({ count, likedUser });
  } catch (err) {
    console.error("GET /api/likes erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/likes  { newsId, userId }  → alterna (curtir/descurtir)
export async function POST(req: Request) {
  try {
    const { newsId, userId } = await req.json();
    if (!newsId || !userId) {
      return NextResponse.json({ error: "newsId e userId são obrigatórios" }, { status: 400 });
    }

    const existing = await prisma.like.findFirst({
      where: { newsId, userId },
      select: { id: true },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { newsId } });
      return NextResponse.json({ liked: false, count });
    } else {
      await prisma.like.create({ data: { newsId, userId } });
      const count = await prisma.like.count({ where: { newsId } });
      return NextResponse.json({ liked: true, count });
    }
  } catch (err) {
    console.error("POST /api/likes erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

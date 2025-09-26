import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      include: { author: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

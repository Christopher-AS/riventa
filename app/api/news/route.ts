import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/news
// Retorna posts recentes (atuando como "news" do feed).
export async function GET() {
  try {
    const items = await prisma.post.findMany({
      include: {
        user: true, // inclui autor; ajuste se quiser selecionar campos
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error("GET /api/news error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "erro inesperado" },
      { status: 500 }
    );
  }
}

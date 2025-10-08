import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // se quebrar, troque para "@/lib/prisma"

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

/**
 * GET /api/followers?userId=<USER_ID>&limit=20&cursor=<followId>
 * - userId: usuário-alvo (listaremos quem segue este usuário)
 * - limit: 1..100 (default 20)
 * - cursor: paginação por ID de Follow (use o nextCursor da resposta anterior)
 *
 * Resposta:
 * {
 *   ok: true,
 *   items: [{ id, follower: { id, email }, createdAt }],
 *   nextCursor: string | null
 * }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    if (!userId) return bad("userId é obrigatório");

    const limitParam = Number(searchParams.get("limit") || 20);
    const limit = Math.min(Math.max(limitParam, 1), 100);
    const cursor = searchParams.get("cursor") || undefined;

    const rows = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1, // pega um a mais pra saber se tem próxima página
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | null = null;
    let items = rows;
    if (rows.length > limit) {
      const next = rows.pop()!; // remove o extra
      nextCursor = next.id;
      items = rows;
    }

    return NextResponse.json({
      ok: true,
      items: items.map((f) => ({
        id: f.id,
        follower: f.follower, // { id, email }
        createdAt: f.createdAt,
      })),
      nextCursor,
    });
  } catch (e: any) {
    console.error("GET /api/followers error:", e);
    return NextResponse.json(
      {
        ok: false,
        error: "Falha ao listar seguidores",
        detail: String(e?.message ?? e),
      },
      { status: 500 }
    );
  }
}

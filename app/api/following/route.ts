// app/api/following/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // se houver erro de alias, ajuste para caminho relativo: "../../lib/prisma"
import { z } from "zod";

const querySchema = z.object({
  userId: z.string().min(1, "userId obrigatório"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// GET /api/following?userId=&limit=&cursor=
// Lista quem o usuário está seguindo (Follow.followerId = userId)
// Ordem: createdAt desc | Paginação por cursor de id
export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Parâmetros inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, limit, cursor } = parsed.data;
    const take = limit + 1; // pegar 1 a mais para calcular nextCursor

    const results = await prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        following: { select: { id: true, email: true } },
      },
    });

    let nextCursor: string | null = null;
    let items = results;

    if (results.length > limit) {
      const nextItem = results[limit];
      nextCursor = nextItem.id;
      items = results.slice(0, limit);
    }

    return NextResponse.json({
      ok: true,
      items: items.map((f) => ({
        id: f.id,
        following: { id: f.following.id, email: f.following.email },
        createdAt: f.createdAt,
      })),
      nextCursor,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Erro interno" },
      { status: 500 }
    );
  }
}

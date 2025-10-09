import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // se o alias falhar, troque para "../../../lib/prisma"
import { z } from "zod";

const querySchema = z.object({
  userId: z.string().min(1, "userId obrigatório"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// GET /api/feed?userId=&limit=&cursor=
// Retorna posts de quem o userId segue + seus próprios
// Inclui likeCount e viewerHasLiked
// Ordenação: createdAt desc, id desc
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

    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = follows.map(f => f.followingId);
    const authorIds = Array.from(new Set([...followingIds, userId]));
    const take = limit + 1;

    const posts = await prisma.post.findMany({
      where: { authorId: { in: authorIds } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        author: { select: { id: true, email: true } },
        _count: { select: { likes: true } },
        likes: { where: { userId }, select: { id: true } },
      },
    });

    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      if (nextItem) nextCursor = nextItem.id;
    }

    const items = posts.map(post => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      author: post.author,
      likeCount: post._count.likes,
      viewerHasLiked: post.likes.length > 0,
    }));

    return NextResponse.json({ ok: true, items, nextCursor });
  } catch (err: any) {
    console.error("Erro no feed:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Erro interno" },
      { status: 500 }
    );
  }
}

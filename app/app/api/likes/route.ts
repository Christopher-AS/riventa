import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  userId: z.string().min(1, "userId obrigatório"),
  postId: z.string().min(1, "postId obrigatório"),
});

// GET /api/likes?postId=&viewerId=
// Retorna contagem e se o viewer curtiu.
export async function GET(req: NextRequest) {
  try {
    const postId = req.nextUrl.searchParams.get("postId");
    const viewerId = req.nextUrl.searchParams.get("viewerId") || undefined;

    if (!postId) {
      return NextResponse.json({ ok: false, error: "postId obrigatório" }, { status: 400 });
    }

    const [likeCount, viewerLike] = await Promise.all([
      prisma.like.count({ where: { postId } }),
      viewerId ? prisma.like.findFirst({ where: { postId, userId: viewerId } }) : Promise.resolve(null),
    ]);

    return NextResponse.json({ ok: true, likeCount, viewerHasLiked: !!viewerLike });
  } catch (err: any) {
    console.error("GET /api/likes error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "erro inesperado" }, { status: 500 });
  }
}

// POST /api/likes  { userId, postId }
// Alterna like/unlike sem depender de índice composto.
export async function POST(req: NextRequest) {
  try {
    const data = bodySchema.parse(await req.json());

    const existing = await prisma.like.findFirst({
      where: { userId: data.userId, postId: data.postId },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const likeCount = await prisma.like.count({ where: { postId: data.postId } });
      return NextResponse.json({ ok: true, liked: false, likeCount });
    } else {
      await prisma.like.create({ data: { userId: data.userId, postId: data.postId } });
      const likeCount = await prisma.like.count({ where: { postId: data.postId } });
      return NextResponse.json({ ok: true, liked: true, likeCount });
    }
  } catch (err: any) {
    console.error("POST /api/likes error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? "erro inesperado" }, { status: 400 });
  }
}

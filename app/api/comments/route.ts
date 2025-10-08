// app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/comments?postId=...
 * Lista comentários do post (ordenados por createdAt ASC)
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "postId é obrigatório" },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: { include: { profile: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("GET /api/comments erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/**
 * POST /api/comments
 * body: { postId: string, userId: string, content: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}) as any);
    const postId: string | undefined = body.postId;
    const userId: string | undefined = body.userId;
    const content: string | undefined = body.content;

    if (!postId || !userId || !content?.trim()) {
      return NextResponse.json(
        { error: "postId, userId e content são obrigatórios" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content: content.trim(),
      },
      include: {
        user: { include: { profile: true } },
      },
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
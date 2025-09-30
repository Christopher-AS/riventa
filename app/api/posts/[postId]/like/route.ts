import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    // Await params no Next.js 15
    const { postId } = await params;
    
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "userId obrigatório" },
        { status: 400 }
      );
    }

    if (!postId) {
      return NextResponse.json(
        { ok: false, error: "postId obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se já existe like
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let action: "liked" | "unliked";

    if (existingLike) {
      // Remover like
      await prisma.postLike.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      action = "unliked";
    } else {
      // Adicionar like
      await prisma.postLike.create({
        data: {
          userId,
          postId,
        },
      });
      action = "liked";
    }

    // Contar total de likes
    const count = await prisma.postLike.count({
      where: { postId },
    });

    return NextResponse.json({
      ok: true,
      action,
      postId,
      userId,
      count,
    });
  } catch (error) {
    console.error("POST /api/posts/[postId]/like error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Falha ao processar like",
        detail: String(error?.message ?? error),
      },
      { status: 500 }
    );
  }
}

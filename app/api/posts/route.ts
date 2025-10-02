import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/posts
// Cria um novo post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, authorId, imageUrl } = body;

    if (!content?.trim() || !authorId) {
      return NextResponse.json(
        { error: "content e authorId são obrigatórios" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId,
        imageUrl: imageUrl || null,
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, post });
  } catch (error: any) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Erro ao criar post", detail: error?.message },
      { status: 500 }
    );
  }
}
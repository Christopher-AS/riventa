import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = await req.json();
    const postId = params.postId;

    // verifica se o post existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "post não encontrado" }, { status: 404 });
    }

    // verifica se já existe like
    const existingLike = await prisma.postLike.findFirst({
      where: {
        postId,
        userId,
      },
    });

    let like;

    if (existingLike) {
      // se já existe like, remove (toggle)
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      like = null;
    } else {
      // senão, cria o like
      like = await prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
    }

    return NextResponse.json({ ok: true, like });
  } catch (error: any) {
    console.error("Erro ao processar like:", error);
    return NextResponse.json(
      { error: "Falha ao processar like", detail: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
// caminho relativo: from app/api/posts/[postId]/like -> app/lib/prisma
import { prisma } from "../../../../lib/prisma";

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = (params.postId || "").trim();
    const { userId } = await req.json();

    if (!postId) return bad("postId obrigatório");
    if (!userId) return bad("userId obrigatório");

    // 1) valida existência do post
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return bad("post não encontrado", 404);

    // 2) checa se já existe like (chave composta única)
    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    let toggled: "liked" | "unliked";
    if (existing) {
      // remove (toggle off)
      await prisma.postLike.delete({
        where: { id: existing.id },
      });
      toggled = "unliked";
    } else {
      // cria (toggle on)
      await prisma.postLike.create({
        data: { postId, userId },
      });
      toggled = "liked";
    }

    const count = await prisma.postLike.count({ where: { postId } });

    return NextResponse.json({ ok: true, action: toggled, postId, userId, count });
  } catch (e: any) {
    console.error("POST /posts/[postId]/like error:", e);
    return NextResponse.json(
      { ok: false, error: "Falha ao processar like", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

// opcional: DELETE explícito (unlike idempotente)
export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = (params.postId || "").trim();
    const { userId } = await req.json();

    if (!postId) return bad("postId obrigatório");
    if (!userId) return bad("userId obrigatório");

    await prisma.postLike.deleteMany({ where: { postId, userId } });
    const count = await prisma.postLike.count({ where: { postId } });

    return NextResponse.json({ ok: true, action: "unliked", postId, userId, count });
  } catch (e: any) {
    console.error("DELETE /posts/[postId]/like error:", e);
    return NextResponse.json(
      { ok: false, error: "Falha ao remover like", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

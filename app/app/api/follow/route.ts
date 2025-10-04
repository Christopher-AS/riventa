import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma"; // caminho relativo: app/api/follow -> app/lib/prisma

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

/**
 * Seguir/Desseguir (toggle) via POST:
 * body: { followerId, followingId }
 * Retorna { ok, action: "followed" | "unfollowed", followerId, followingId, count }
 */
export async function POST(req: Request) {
  try {
    const { followerId, followingId } = await req.json();

    if (!followerId || !followingId)
      return bad("followerId e followingId são obrigatórios");
    if (followerId === followingId) return bad("não pode seguir a si mesmo");

    // valida usuários (opcional, mas ajuda a depurar)
    const [follower, following] = await Promise.all([
      prisma.user.findUnique({ where: { id: followerId } }),
      prisma.user.findUnique({ where: { id: followingId } }),
    ]);
    if (!follower) return bad("follower não encontrado", 404);
    if (!following) return bad("following não encontrado", 404);

    // chave composta definida no schema: @@unique([followerId, followingId])
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    let action: "followed" | "unfollowed";
    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      action = "unfollowed";
    } else {
      await prisma.follow.create({ data: { followerId, followingId } });
      action = "followed";
    }

    const count = await prisma.follow.count({ where: { followingId } }); // seguidores desse following

    return NextResponse.json({
      ok: true,
      action,
      followerId,
      followingId,
      count,
    });
  } catch (e: any) {
    console.error("POST /api/follow error:", e);
    return NextResponse.json(
      {
        ok: false,
        error: "Falha ao processar follow",
        detail: String(e?.message ?? e),
      },
      { status: 500 }
    );
  }
}

/**
 * Remover follow explicitamente (idempotente) via DELETE:
 * body: { followerId, followingId }
 */
export async function DELETE(req: Request) {
  try {
    const { followerId, followingId } = await req.json();
    if (!followerId || !followingId)
      return bad("followerId e followingId são obrigatórios");

    await prisma.follow.deleteMany({ where: { followerId, followingId } });
    const count = await prisma.follow.count({ where: { followingId } });

    return NextResponse.json({
      ok: true,
      action: "unfollowed",
      followerId,
      followingId,
      count,
    });
  } catch (e: any) {
    console.error("DELETE /api/follow error:", e);
    return NextResponse.json(
      {
        ok: false,
        error: "Falha ao remover follow",
        detail: String(e?.message ?? e),
      },
      { status: 500 }
    );
  }
}

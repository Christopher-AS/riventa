import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // se o alias falhar, troque para "../../../lib/prisma"
import { z } from "zod";

const bodySchema = z.object({
  userId: z.string().min(1, "userId obrigatório"),
});

/**
 * Compatível com Next 15: "context.params" pode vir como Promise.
 * Tipamos "ctx" como any e normalizamos para aceitar Promise ou objeto.
 */
export async function POST(req: NextRequest, ctx: any) {
  try {
    const raw = ctx?.params;
    const params = raw && typeof raw.then === "function" ? await raw : raw;
    const postId = params?.postId as string;

    if (!postId) {
      return NextResponse.json(
        { ok: false, error: "postId ausente nos parâmetros" },
        { status: 400 }
      );
    }

    const json = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    const { userId } = parsed.data;

    const existing = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    let action: "liked" | "unliked";
    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
      action = "unliked";
    } else {
      await prisma.postLike.create({ data: { userId, postId } });
      action = "liked";
    }

    const count = await prisma.postLike.count({ where: { postId } });

    return NextResponse.json({
      ok: true,
      action,
      postId,
      userId,
      count,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Erro interno" },
      { status: 500 }
    );
  }
}

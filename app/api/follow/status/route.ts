import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const followerId = searchParams.get("followerId") || undefined;
    const followingId = searchParams.get("followingId") || undefined;

    if (!followingId) return bad("followingId é obrigatório");

    const [followersCount, followingCount, isFollowing] = await Promise.all([
      prisma.follow.count({ where: { followingId } }),
      prisma.follow.count({ where: { followerId: followingId } }),
      followerId
        ? prisma.follow
            .findUnique({
              where: { followerId_followingId: { followerId, followingId } },
            })
            .then((x) => Boolean(x))
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      ok: true,
      followingId,
      followerId: followerId ?? null,
      isFollowing,
      counts: {
        followers: followersCount,
        following: followingCount,
      },
    });
  } catch (e: any) {
    console.error("GET /api/follow/status error:", e);
    return NextResponse.json(
      {
        ok: false,
        error: "Falha ao ler status",
        detail: String(e?.message ?? e),
      },
      { status: 500 }
    );
  }
}

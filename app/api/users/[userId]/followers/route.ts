import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar todos os seguidores do usuário
    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Formatar resposta
    const formattedFollowers = followers.map((follow) => ({
      id: follow.follower.id,
      email: follow.follower.email,
      name: follow.follower.profile?.name || follow.follower.email.split("@")[0],
      avatar: follow.follower.profile?.avatar || null,
      followedAt: follow.createdAt,
    }));

    return NextResponse.json({
      ok: true,
      followers: formattedFollowers,
      count: formattedFollowers.length,
    });
  } catch (error: any) {
    console.error("GET /api/users/[userId]/followers error:", error);
    return NextResponse.json(
      { ok: false, error: "Erro ao buscar seguidores" },
      { status: 500 }
    );
  }
}

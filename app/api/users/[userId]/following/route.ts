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

    // Buscar todos os usuários que este usuário segue
    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
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
    const formattedFollowing = following.map((follow) => ({
      id: follow.following.id,
      email: follow.following.email,
      name: follow.following.profile?.name || follow.following.email.split("@")[0],
      avatar: follow.following.profile?.avatar || null,
      followedAt: follow.createdAt,
    }));

    return NextResponse.json({
      ok: true,
      following: formattedFollowing,
      count: formattedFollowing.length,
    });
  } catch (error: any) {
    console.error("GET /api/users/[userId]/following error:", error);
    return NextResponse.json(
      { ok: false, error: "Erro ao buscar seguindo" },
      { status: 500 }
    );
  }
}

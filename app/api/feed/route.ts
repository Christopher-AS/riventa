import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

type FeedItem = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  author: {
    id: string;
    email: string;
    profile: {
      name: string | null;
      avatar: string | null;
    } | null;
  };
  likeCount: number;
  commentCount: number;
};

export async function GET(req: NextRequest) {
  try {
    // Obter sessão do usuário autenticado
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { ok: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id as string;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "userId não encontrado na sessão" },
        { status: 400 }
      );
    }

    // Buscar IDs que o usuário segue
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = follows.map(f => f.followingId);
    
    // IDs dos autores: seguidos + próprio usuário
    const authorIds = Array.from(new Set([...followingIds, userId]));

    // Buscar posts desses autores
    const posts = await prisma.post.findMany({
      where: { authorId: { in: authorIds } },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Mapear para o formato de resposta
    const items: FeedItem[] = posts.map(post => ({
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      author: post.author,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
    }));

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error("Erro no feed:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Erro interno" },
      { status: 500 }
    );
  }
}

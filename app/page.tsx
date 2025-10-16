// app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id ?? null;

  let posts: Array<{
    id: string;
    content: string | null;
    createdAt: Date;
    author: {
      id: string;
      email: string | null;
      profile?: { name: string | null; avatar: string | null } | null;
    };
    _count: { likes: number; comments: number };
  }> = [];

  if (userId) {
    // IDs que o usuário segue
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = follows.map((f) => f.followingId);

    // Query 1: Posts de quem o usuário segue (incluindo próprio usuário)
    const followingPosts = await prisma.post.findMany({
      where: { authorId: { in: [...followingIds, userId] } },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: { select: { name: true, avatar: true } },
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    // Query 2: Posts de descoberta (usuários que NÃO segue)
    // Ordenados por engajamento (likes + comments) direto no banco
    const discoveryPosts = await prisma.post.findMany({
      where: {
        authorId: { notIn: [...followingIds, userId] },
      },
      orderBy: [
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } }
      ],
      take: 20,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: { select: { name: true, avatar: true } },
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    // Combinar os dois feeds
    posts = [...followingPosts, ...discoveryPosts];
  } else {
    // Sem login: mostrar apenas discovery posts ordenados por engajamento
    posts = await prisma.post.findMany({
      orderBy: [
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } }
      ],
      take: 20,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: { select: { name: true, avatar: true } },
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  return (
    <main className="mx-auto max-w-2xl p-4 space-y-4">
      {!userId && (
        <div className="rounded-lg border p-3 text-sm">
          Faça login para ver seu feed personalizado. Exibindo posts populares.
        </div>
      )}

      {/* Posts Sociais */}
      {posts.map((p) => (
        <article key={p.id} className="rounded-xl border p-4">
          <header className="flex items-center gap-3">
            {/* Avatar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                p.author.profile?.avatar ??
                `https://i.pravatar.cc/64?u=${p.author.id}`
              }
              alt=""
              className="h-10 w-10 rounded-full"
            />
            <div>
              <div className="font-medium">
                {p.author.profile?.name ?? p.author.email ?? "Usuário"}
              </div>
              <div className="text-xs opacity-60">
                {new Date(p.createdAt).toLocaleString()}
              </div>
            </div>
          </header>

          <p className="mt-3 whitespace-pre-wrap">{p.content}</p>

          <footer className="mt-3 text-sm opacity-70">
            ❤️ {p._count.likes} · 💬 {p._count.comments}
            <span className="ml-3">
              <Link href={`/u/${p.author.id}`} className="underline">
                ver perfil
              </Link>
            </span>
          </footer>
        </article>
      ))}
    </main>
  );
}

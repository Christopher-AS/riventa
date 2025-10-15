// app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import NewsCard from "@/components/NewsCard";

type NewsData = {
  title: string;
  subtitle: string;
  imageUrl: string;
  content: string;
  sources: Array<{
    name: string;
    url: string;
  }>;
};

async function getNews(): Promise<NewsData | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/news`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error('Erro ao buscar notícias:', res.status);
      return null;
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    return null;
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id ?? null;

  // Buscar notícias
  const newsData = await getNews();

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
    // Ordenados por engajamento (likes + comments)
    const allDiscoveryPosts = await prisma.post.findMany({
      where: {
        authorId: { notIn: [...followingIds, userId] },
      },
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

    // Ordenar por engajamento (likes + comments) e pegar top 20
    const discoveryPosts = allDiscoveryPosts
      .sort((a, b) => {
        const engagementA = a._count.likes + a._count.comments;
        const engagementB = b._count.likes + b._count.comments;
        return engagementB - engagementA;
      })
      .slice(0, 20);

    // Combinar os dois feeds
    posts = [...followingPosts, ...discoveryPosts];
  } else {
    // Sem login: mostrar apenas discovery posts ordenados por engajamento
    const allPosts = await prisma.post.findMany({
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

    // Ordenar por engajamento e pegar top 20
    posts = allPosts
      .sort((a, b) => {
        const engagementA = a._count.likes + a._count.comments;
        const engagementB = b._count.likes + b._count.comments;
        return engagementB - engagementA;
      })
      .slice(0, 20);
  }

  return (
    <main className="mx-auto max-w-2xl p-4 space-y-4">
      {!userId && (
        <div className="rounded-lg border p-3 text-sm">
          Faça login para ver seu feed personalizado. Exibindo posts populares.
        </div>
      )}

      {/* Seção de Notícias */}
      {newsData && (
        <NewsCard
          title={newsData.title}
          subtitle={newsData.subtitle}
          imageUrl={newsData.imageUrl}
          content={newsData.content}
          sources={newsData.sources}
        />
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

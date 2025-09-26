import PostCard from "./components/PostCard";
import NewPostForm from "./components/NewPostForm";
import { prisma } from "@/lib/prisma"; // se o alias falhar, troque para "../lib/prisma"

export const dynamic = "force-dynamic";

type FeedItem = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; email: string };
  likeCount: number;
  viewerHasLiked: boolean;
};

export default async function Page() {
  // Para a POC, usamos a Alice como "usuária logada"
  const viewerEmail = "alice@demo.com";
  const viewer = await prisma.user.findUnique({
    where: { email: viewerEmail },
    select: { id: true, email: true },
  });

  if (!viewer) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Riventa</h1>
        <p className="mt-4 text-red-600">
          Usuária de teste não encontrada (alice@demo.com). Verifique o seed.
        </p>
      </main>
    );
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/feed?userId=${viewer.id}&limit=20`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Riventa</h1>
        <p className="mt-4 text-red-600">
          Erro ao carregar o feed: {res.status} {res.statusText}
        </p>
      </main>
    );
  }

  const data = (await res.json()) as { ok: boolean; items: FeedItem[] };
  const items = data?.items ?? [];

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Feed (Alice)</h1>

      {/* Formulário de novo post */}
      <NewPostForm viewerId={viewer.id} />

      {/* Lista do feed */}
      {items.length === 0 ? (
        <p className="text-gray-600">Nenhum post dos perfis que você segue.</p>
      ) : (
        <div className="space-y-4">
          {items.map((post) => (
            <PostCard key={post.id} post={post} viewerId={viewer.id} />
          ))}
        </div>
      )}
    </main>
  );
}

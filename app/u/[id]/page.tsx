import Link from "next/link";
import FollowButton from "../../components/FollowButton";
import prisma from "@/lib/prisma"; // se o alias falhar, use "../../../lib/prisma"

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  // Usuária "logada" para POC
  const viewerEmail = "alice@demo.com";

  const [viewer, target] = await Promise.all([
    prisma.user.findUnique({
      where: { email: viewerEmail },
      select: { id: true, email: true },
    }),
    prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true },
    }),
  ]);

  if (!viewer) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Perfil</h1>
        <p className="mt-4 text-red-600">
          Usuária de teste não encontrada (alice@demo.com).
        </p>
      </main>
    );
  }

  if (!target) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Perfil</h1>
        <p className="mt-4 text-red-600">Usuário não encontrado.</p>
      </main>
    );
  }

  // Contadores e status (server-side, direto no banco)
  const [followersCount, followingCount, rel] = await Promise.all([
    prisma.follow.count({ where: { followingId: target.id } }),
    prisma.follow.count({ where: { followerId: target.id } }),
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: viewer.id,
          followingId: target.id,
        },
      },
      select: { id: true },
    }),
  ]);

  const isFollowing = !!rel;

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="text-gray-700">
          <span className="font-medium">{target.email}</span>
        </p>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          <Link
            href={`/u/${target.id}/followers`}
            className="hover:underline"
            title="Ver seguidores"
          >
            <strong>{followersCount}</strong> seguidores
          </Link>
          <Link
            href={`/u/${target.id}/following`}
            className="hover:underline"
            title="Ver quem segue"
          >
            <strong>{followingCount}</strong> seguindo
          </Link>
        </div>

        <div className="pt-2">
          <FollowButton targetUserId={target.id} viewerId={viewer.id} />
          <span className="ml-3 text-xs text-gray-500">
            (estado inicial: {isFollowing ? "seguindo" : "não seguindo"})
          </span>
        </div>
      </header>
    </main>
  );
}

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import FollowButton from "@/components/FollowButton";
import ProfileStats from "@/components/ProfileStats";
import Link from "next/link";

type PageProps = {
  params: Promise<{ userId: string }>;
};

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params;

  // Obter sessão do usuário logado
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id;

  // Carregar usuário com profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          name: true,
          avatar: true,
          bio: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Carregar contadores de followers e following
  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  // Carregar TODOS os posts do usuário ordenados por data
  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  const displayName = user.profile?.name || user.email;
  const avatarUrl = user.profile?.avatar || null;
  const bio = user.profile?.bio || null;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Cabeçalho do perfil */}
      <div className="flex items-start gap-8 mb-12">
        {/* Avatar grande */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Informações do usuário */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            {/* Botão de seguir */}
            {viewerId && viewerId !== userId && (
              <FollowButton targetUserId={userId} viewerId={viewerId} />
            )}
          </div>

          {/* Contadores usando ProfileStats */}
          <ProfileStats
            userId={userId}
            viewerId={viewerId || ""}
            followersCount={followersCount}
            followingCount={followingCount}
            postsCount={posts.length}
          />

          {/* Bio */}
          {bio && <p className="text-gray-800 whitespace-pre-wrap mt-4">{bio}</p>}
        </div>
      </div>

      {/* Divisor */}
      <div className="border-t border-gray-300 mb-8"></div>

      {/* Grade de posts estilo Instagram */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Nenhum post ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:opacity-75 transition-opacity cursor-pointer group relative block"
            >
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center p-4">
                  <p className="text-sm text-gray-600 line-clamp-6 text-center">
                    {post.content}
                  </p>
                </div>
              )}
              {/* Overlay com hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200"></div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

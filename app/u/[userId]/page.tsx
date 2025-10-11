import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import FollowButton from "@/components/FollowButton";

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

          {/* Contadores */}
          <div className="flex gap-6 mb-4">
            <div>
              <span className="font-bold text-lg">{posts.length}</span>
              <span className="text-gray-600 ml-1">posts</span>
            </div>
            <div>
              <span className="font-bold text-lg">{followersCount}</span>
              <span className="text-gray-600 ml-1">seguidores</span>
            </div>
            <div>
              <span className="font-bold text-lg">{followingCount}</span>
              <span className="text-gray-600 ml-1">seguindo</span>
            </div>
          </div>

          {/* Bio */}
          {bio && <p className="text-gray-800 whitespace-pre-wrap">{bio}</p>}
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
            <div
              key={post.id}
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer group relative"
            >
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full p-4 flex items-center justify-center text-center">
                  <p className="text-sm text-gray-700 line-clamp-6">
                    {post.content}
                  </p>
                </div>
              )}
              {/* Overlay com hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"></div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

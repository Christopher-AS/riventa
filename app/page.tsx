import prisma from "@/lib/prisma";
import PostCard from "./components/PostCard";

export const dynamic = "force-dynamic";

async function getPosts() {
  const posts = await prisma.post.findMany({
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
      likes: true,
      comments: {
        include: {
          user: {
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
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return posts;
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Feed</h1>

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Nenhuma publicacao ainda.</p>
            <p className="text-sm text-gray-400 mt-2">
              Seja o primeiro a criar uma publicacao!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

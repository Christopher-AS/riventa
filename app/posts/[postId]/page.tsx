import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type PageProps = {
  params: Promise<{ postId: string }>;
};

async function getPost(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        include: {
          profile: true,
        },
      },
      likes: {
        include: {
          user: true,
        },
      },
      comments: {
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return post;
}

async function getAdjacentPosts(postId: string, createdAt: Date) {
  const [previousPost, nextPost] = await Promise.all([
    prisma.post.findFirst({
      where: {
        createdAt: { lt: createdAt },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
      },
    }),
    prisma.post.findFirst({
      where: {
        createdAt: { gt: createdAt },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
      },
    }),
  ]);

  return { previousPost, nextPost };
}

export default async function PostPage({ params }: PageProps) {
  const { postId } = await params;
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id || "";

  const post = await getPost(postId);

  if (!post) {
    notFound();
  }

  const { previousPost, nextPost } = await getAdjacentPosts(
    post.id,
    post.createdAt
  );

  const authorName = post.author.profile?.name || post.author.email;
  const authorAvatar = post.author.profile?.avatar;
  const likesCount = post.likes.length;
  const commentsCount = post.comments.length;
  const viewerHasLiked = post.likes.some((like) => like.userId === viewerId);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation Arrows */}
        <div className="flex justify-between items-center mb-6">
          <div>
            {previousPost ? (
              <Link
                href={`/posts/${previousPost.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Post Anterior</span>
              </Link>
            ) : (
              <div className="px-4 py-2 text-gray-400">Primeiro post</div>
            )}
          </div>

          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Voltar ao Feed
          </Link>

          <div>
            {nextPost ? (
              <Link
                href={`/posts/${nextPost.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <span>Próximo Post</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ) : (
              <div className="px-4 py-2 text-gray-400">Último post</div>
            )}
          </div>
        </div>

        {/* Post Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Author Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <Link href={`/u/${post.author.id}`}>
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div className="flex-1">
              <Link
                href={`/u/${post.author.id}`}
                className="font-semibold hover:underline"
              >
                {authorName}
              </Link>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Image */}
          {post.imageUrl && (
            <div className="w-full bg-black flex items-center justify-center">
              <img
                src={post.imageUrl}
                alt="Post"
                className="max-w-full max-h-[600px] object-contain"
              />
            </div>
          )}

          {/* Actions Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <LikeButton
                postId={post.id}
                viewerId={viewerId}
                initialCount={likesCount}
                initialViewerHasLiked={viewerHasLiked}
              />
              <div className="flex items-center gap-2 text-gray-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-sm font-medium">{commentsCount}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-4 border-b border-gray-200">
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Likes Summary */}
          {likesCount > 0 && (
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-semibold">
                {likesCount} {likesCount === 1 ? "curtida" : "curtidas"}
              </p>
            </div>
          )}

          {/* Comments Section */}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-4">
              Comentários ({commentsCount})
            </h3>

            {post.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            ) : (
              <div className="space-y-4">
                {post.comments.map((comment) => {
                  const commentAuthorName =
                    comment.user.profile?.name || comment.user.email;
                  const commentAuthorAvatar = comment.user.profile?.avatar;

                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Link href={`/u/${comment.user.id}`}>
                        {commentAuthorAvatar ? (
                          <img
                            src={commentAuthorAvatar}
                            alt={commentAuthorName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {commentAuthorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Link>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <Link
                            href={`/u/${comment.user.id}`}
                            className="font-semibold text-sm hover:underline"
                          >
                            {commentAuthorName}
                          </Link>
                          <p className="text-gray-900 text-sm mt-1">
                            {comment.content}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-3">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

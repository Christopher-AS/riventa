import LikeButton from "./LikeButton";

type Post = {
  id: string;
  content: string;
  createdAt: string | Date;
  author: { id: string; email: string };
  likeCount: number;
  viewerHasLiked: boolean;
};

export default function PostCard({
  post,
  viewerId,
}: {
  post: Post;
  viewerId: string;
}) {
  const created =
    typeof post.createdAt === "string"
      ? new Date(post.createdAt)
      : post.createdAt;

  return (
    <article className="rounded-2xl border border-gray-200 p-4 shadow-sm bg-white">
      <header className="mb-2 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">{post.author.email}</span>
          <span className="mx-2">•</span>
          <time dateTime={created.toISOString()}>
            {created.toLocaleString()}
          </time>
        </div>
      </header>

      <p className="mb-3 whitespace-pre-wrap text-gray-900">{post.content}</p>

      <div className="flex items-center gap-3">
        <LikeButton
          postId={post.id}
          viewerId={viewerId}
          initialCount={post.likeCount}
          initialViewerHasLiked={post.viewerHasLiked}
        />
        <span className="text-xs text-gray-500">
          ID: <code className="select-all">{post.id}</code>
        </span>
      </div>
    </article>
  );
}

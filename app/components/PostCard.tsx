"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import CommentInput from "./CommentInput";
import FollowButton from "./FollowButton";

type Post = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    email: string;
    profile?: {
      name: string | null;
      avatar: string | null;
    } | null;
  };
  likes: { userId: string }[];
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      email: string;
      profile?: {
        name: string | null;
        avatar: string | null;
      } | null;
    };
  }[];
  _count: {
    likes: number;
    comments: number;
  };
};

export default function PostCard({ post }: { post: Post }) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [commentsCount, setCommentsCount] = useState(post._count.comments);

  const userId = session?.user?.id || "";

  const authorName = post.author.profile?.name || post.author.email;
  const authorAvatar = post.author.profile?.avatar;
  const authorInitial = authorName[0].toUpperCase();

  const handleLike = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likesCount);
        setIsLiked(data.liked);
      }
    } catch (error) {
      console.error("Erro ao dar like:", error);
    }
  };

  const handleCommentAdded = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setCommentsCount(data.comments.length);
      }
    } catch (error) {
      console.error("Erro ao recarregar comentarios:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start gap-3 mb-4">
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {authorInitial}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {authorName}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
            {userId && post.author.id !== userId && (
              <FollowButton targetUserId={post.author.id} viewerId={userId} />
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

      <div className="flex gap-2 pt-3 border-t">
        <button
          onClick={handleLike}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            isLiked
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          Curtir {likes}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 text-gray-700 transition-colors"
        >
          Comentar {commentsCount}
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t">
          {comments.length > 0 ? (
            <div className="space-y-3 mb-4">
              {comments.map((comment) => {
                const commentUserName = comment.user.profile?.name || comment.user.email;
                const commentUserAvatar = comment.user.profile?.avatar;
                const commentUserInitial = commentUserName[0].toUpperCase();

                return (
                  <div key={comment.id} className="flex gap-3">
                    {commentUserAvatar ? (
                      <img
                        src={commentUserAvatar}
                        alt={commentUserName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {commentUserInitial}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="font-semibold text-sm text-gray-900">
                          {commentUserName}
                        </p>
                        <p className="text-gray-800 text-sm mt-1">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-3">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4 mb-4">
              Nenhum comentario ainda. Seja o primeiro!
            </p>
          )}

          <CommentInput postId={post.id} userId={userId} onCommentAdded={handleCommentAdded} />
        </div>
      )}
    </div>
  );
}

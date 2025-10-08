"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import CommentInput from "./CommentInput";

type Post = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    email: string;
  };
  likes: { userId: string }[];
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      email: string;
    };
  }[];
  _count: {
    likes: number;
    comments: number;
  };
};

export default function PostCard({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [commentsCount, setCommentsCount] = useState(post._count.comments);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "bf96eb9a-3e36-42c5-ae75-6dd8b34f7844" }),
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
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {post.author.email[0].toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {post.author.email}
          </h3>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>
      </div>

      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 pt-3 border-t">
        <span>{likes} curtidas</span>
        <span>{commentsCount} comentarios</span>
      </div>

      <div className="flex gap-2 pt-3 border-t">
        <button
          onClick={handleLike}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            isLiked
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          Curtir
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 text-gray-700 transition-colors"
        >
          Comentar
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t">
          {comments.length > 0 ? (
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {comment.user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="font-semibold text-sm text-gray-900">
                        {comment.user.email}
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
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4 mb-4">
              Nenhum comentario ainda. Seja o primeiro!
            </p>
          )}
          
          <CommentInput postId={post.id} onCommentAdded={handleCommentAdded} />
        </div>
      )}
    </div>
  );
}

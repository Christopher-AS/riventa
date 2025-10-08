"use client";

import { useState } from "react";

type CommentInputProps = {
  postId: string;
  onCommentAdded: () => void;
};

export default function CommentInput({ postId, onCommentAdded }: CommentInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          userId: "bf96eb9a-3e36-42c5-ae75-6dd8b34f7844",
        }),
      });

      if (response.ok) {
        setContent("");
        onCommentAdded();
      } else {
        console.error("Erro ao criar comentario");
      }
    } catch (error) {
      console.error("Erro ao enviar comentario:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mt-4">
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
        U
      </div>
      <div className="flex-1">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva um comentario..."
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          disabled={isSubmitting}
        />
      </div>
      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "..." : "Enviar"}
      </button>
    </form>
  );
}

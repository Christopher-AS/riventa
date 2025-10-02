"use client";

import { useState } from "react";
import { X, Image, Smile } from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  userId,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          authorId: userId,
        }),
      });

      if (response.ok) {
        setContent("");
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao criar post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Criar publicação</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Sobre o que você quer falar?"
          className="w-full min-h-[200px] resize-none border-0 p-0 text-lg focus:outline-none focus:ring-0"
        />

        {/* Toolbar */}
        <div className="mt-4 flex items-center gap-2 border-t pt-4">
          <button
            className="rounded-full p-2 hover:bg-gray-100"
            title="Adicionar imagem (em breve)"
          >
            <Image className="h-5 w-5 text-gray-600" />
          </button>
          <button
            className="rounded-full p-2 hover:bg-gray-100"
            title="Adicionar emoji (em breve)"
          >
            <Smile className="h-5 w-5 text-gray-600" />
          </button>

          <div className="ml-auto">
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="rounded-full bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
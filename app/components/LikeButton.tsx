"use client";

import { useState } from "react";

type Props = {
  postId: string;
  viewerId: string; // id do usuário logado (por enquanto usamos o FOLLOWER_ID)
  initialCount: number;
  initialViewerHasLiked: boolean;
};

export default function LikeButton({
  postId,
  viewerId,
  initialCount,
  initialViewerHasLiked,
}: Props) {
  const [count, setCount] = useState<number>(initialCount);
  const [isLiked, setIsLiked] = useState<boolean>(initialViewerHasLiked);
  const [loading, setLoading] = useState<boolean>(false);

  async function onToggle() {
    if (loading) return;
    setLoading(true);

    // Otimista
    const prev = { count, isLiked };
    setIsLiked((v) => !v);
    setCount((c) => (isLiked ? c - 1 : c + 1));

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: viewerId }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        // rollback se falhar
        setIsLiked(prev.isLiked);
        setCount(prev.count);
      } else {
        // sincroniza com o servidor
        if (typeof data.count === "number") setCount(data.count);
        if (typeof data.action === "string")
          setIsLiked(data.action === "liked");
      }
    } catch {
      // rollback em erro de rede
      setIsLiked(prev.isLiked);
      setCount(prev.count);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isLiked}
      disabled={loading}
      className={[
        "inline-flex items-center gap-2 rounded-2xl px-3 py-1",
        "text-sm font-medium",
        isLiked
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <span aria-hidden>{isLiked ? "♥" : "♡"}</span>
      <span>{count}</span>
      <span className="sr-only">{isLiked ? "Descurtir" : "Curtir"}</span>
    </button>
  );
}

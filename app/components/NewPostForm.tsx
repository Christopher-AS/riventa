"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  viewerId: string;
  autofocus?: boolean;
};

export default function NewPostForm({ viewerId, autofocus = true }: Props) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const trimmed = content.trim();
  const disabled = pending || trimmed.length === 0 || content.length > 280;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;

    setError(null);

    try {
      console.log("🔵 Enviando post:", { viewerId, trimmed });

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: viewerId, content: trimmed }),
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      console.log("🟢 Resposta da API:", data);

      if (!res.ok || !data?.ok) {
        throw new Error(
          data?.error ?? `Erro ao publicar (status ${res.status})`
        );
      }

      // sucesso → limpar textarea e recarregar feed
      setContent("");
      startTransition(() => router.refresh());
    } catch (err: any) {
      console.error("🔴 Erro ao publicar:", err);
      setError(err?.message ?? "Erro ao publicar");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Compartilhe algo com sua rede…"
        className="w-full resize-y rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-400"
        rows={3}
        autoFocus={autofocus}
        disabled={pending}
        maxLength={280}
      />

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">{content.length}/280</span>
        <button
          type="submit"
          disabled={disabled}
          className={[
            "rounded-2xl px-4 py-2 text-sm font-medium transition",
            disabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700",
          ].join(" ")}
        >
          {pending ? "Publicando…" : "Publicar"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

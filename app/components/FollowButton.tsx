"use client";

import { useEffect, useState } from "react";

type Props = {
  targetUserId: string; // usuário que será seguido (perfil)
  viewerId: string; // usuário logado (Alice, por enquanto)
};

export default function FollowButton({ targetUserId, viewerId }: Props) {
  const isSelf = targetUserId === viewerId;

  const [loading, setLoading] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Carrega status inicial (isFollowing + contadores)
  useEffect(() => {
    let cancel = false;
    async function load() {
      setError(null);
      try {
        const res = await fetch(
          `/api/follow/status?followingId=${targetUserId}&followerId=${viewerId}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!cancel && res.ok && data?.ok) {
          setIsFollowing(!!data.isFollowing);
          setFollowersCount(Number(data.counts?.followers ?? 0));
        } else if (!cancel && !res.ok) {
          setError(`Erro status: ${res.status}`);
        }
      } catch (e: any) {
        if (!cancel) setError(e?.message ?? "Erro ao carregar status");
      }
    }
    if (!isSelf) load();
    return () => {
      cancel = true;
    };
  }, [targetUserId, viewerId, isSelf]);

  async function onToggle() {
    if (loading || isSelf) return;
    setLoading(true);
    setError(null);

    // Otimista
    const prev = {
      isFollowing,
      followersCount,
    };
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setFollowersCount((c) => (nextFollowing ? c + 1 : Math.max(0, c - 1)));

    try {
      const res = await fetch(`/api/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: viewerId,
          followingId: targetUserId,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        // rollback
        setIsFollowing(prev.isFollowing);
        setFollowersCount(prev.followersCount);
        setError(data?.error ?? "Falha ao atualizar follow");
      } else {
        // sincroniza contagem se o backend retornar `count`
        if (typeof data.count === "number") {
          setFollowersCount(data.count);
        }
        if (typeof data.action === "string") {
          setIsFollowing(data.action === "followed");
        }
      }
    } catch (e: any) {
      // rollback em erro de rede
      setIsFollowing(prev.isFollowing);
      setFollowersCount(prev.followersCount);
      setError(e?.message ?? "Erro de rede");
    } finally {
      setLoading(false);
    }
  }

  if (isSelf) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-gray-500">
        Este é você
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isFollowing}
        disabled={loading}
        className={[
          "inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold transition-colors",
          isFollowing
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
            : "bg-blue-600 text-white hover:bg-blue-700",
          loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        {isFollowing ? "Seguindo" : "Seguir"}
      </button>

      <span className="text-sm text-gray-600">
        Seguidores: <strong>{followersCount}</strong>
      </span>

      {error && (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

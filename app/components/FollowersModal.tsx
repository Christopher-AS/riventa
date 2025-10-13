"use client";

import { useState, useEffect } from "react";
import FollowButton from "./FollowButton";

type Follower = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  followedAt: Date;
};

type FollowersModalProps = {
  userId: string;
  viewerId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function FollowersModal({
  userId,
  viewerId,
  isOpen,
  onClose,
}: FollowersModalProps) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadFollowers();
    }
  }, [isOpen, userId]);

  async function loadFollowers() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${userId}/followers`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Erro ao carregar seguidores");
      }

      setFollowers(data.followers || []);
    } catch (err: any) {
      console.error("Erro ao carregar seguidores:", err);
      setError(err.message || "Erro ao carregar seguidores");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Seguidores</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <button
                onClick={loadFollowers}
                className="mt-2 text-blue-600 hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && followers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum seguidor ainda</p>
            </div>
          )}

          {!loading && !error && followers.length > 0 && (
            <div className="space-y-3">
              {followers.map((follower) => (
                <div
                  key={follower.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {follower.avatar ? (
                        <img
                          src={follower.avatar}
                          alt={follower.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        follower.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Name and Email */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {follower.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {follower.email}
                      </p>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <div className="flex-shrink-0 ml-2">
                    <FollowButton
                      targetUserId={follower.id}
                      viewerId={viewerId}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

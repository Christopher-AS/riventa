"use client";

import { useState } from "react";
import FollowersModal from "./FollowersModal";
import FollowingModal from "./FollowingModal";

type ProfileStatsProps = {
  userId: string;
  viewerId: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
};

export default function ProfileStats({
  userId,
  viewerId,
  followersCount,
  followingCount,
  postsCount,
}: ProfileStatsProps) {
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  return (
    <>
      <div className="flex gap-6 text-sm">
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{postsCount}</span>
          <span className="text-gray-600">Posts</span>
        </div>

        <button
          onClick={() => setShowFollowersModal(true)}
          className="flex flex-col items-center hover:opacity-70 transition-opacity"
        >
          <span className="font-bold text-lg">{followersCount}</span>
          <span className="text-gray-600">Seguidores</span>
        </button>

        <button
          onClick={() => setShowFollowingModal(true)}
          className="flex flex-col items-center hover:opacity-70 transition-opacity"
        >
          <span className="font-bold text-lg">{followingCount}</span>
          <span className="text-gray-600">Seguindo</span>
        </button>
      </div>

      <FollowersModal
        userId={userId}
        viewerId={viewerId}
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
      />

      <FollowingModal
        userId={userId}
        viewerId={viewerId}
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
      />
    </>
  );
}

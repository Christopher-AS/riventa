"use client";

import { useState } from "react";
import CreatePostModal from "./CreatePostModal";

interface SidebarProps {
  userId: string;
}

export default function Sidebar({ userId }: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <aside className="w-64 border-r border-gray-200 bg-white p-4 min-h-screen">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          Criar Publicação
        </button>
      </aside>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
      />
    </>
  );
}
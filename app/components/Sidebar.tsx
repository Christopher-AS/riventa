"use client";

import { useState } from "react";
import CreatePostModal from "./CreatePostModal";

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-600">Riventa</h1>
          <p className="text-sm text-gray-500 mt-1">Social + News</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Criar Post
        </button>
      </aside>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId="bf96eb9a-3e36-42c5-ae75-6dd8b34f7844"
      />
    </>
  );
}

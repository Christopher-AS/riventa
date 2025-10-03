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

        <nav className="space-y-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Criar Post
          </button>

          
            href="/"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Feed
          </a>

          
            href="#"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Perfil
          </a>

          
            href="#"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            News
          </a>
        </nav>
      </aside>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId="user-1"
      />
    </>
  );
}
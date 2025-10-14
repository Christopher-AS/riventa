"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreatePostModal from "./CreatePostModal";

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Se não estiver logado, redireciona para login
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Enquanto carrega a sessão
  if (status === "loading") {
    return (
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-600">Riventa</h1>
          <p className="text-sm text-gray-500 mt-1">Carregando...</p>
        </div>
      </aside>
    );
  }

  const userId = session?.user?.id || "";

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

        <Link
          href="/search"
          className="w-full mt-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          Buscar
        </Link>

        {/* Informações do usuário */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">
            {session?.user?.email}
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 text-sm text-red-600 hover:text-red-700"
          >
            Sair
          </button>
        </div>
      </aside>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
      />
    </>
  );
}

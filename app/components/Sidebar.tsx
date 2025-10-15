"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import CreatePostModal from "./CreatePostModal";
import SearchDrawer from "./SearchDrawer";

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

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

  const isActive = (path: string | RegExp) => {
    if (typeof path === 'string') {
      return pathname === path;
    }
    return path.test(pathname);
  };

  return (
    <>
      <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 p-6 transition-all duration-300 ${isSearchOpen ? 'w-20' : 'w-64'}`}>
        <div className="mb-8">
          {isSearchOpen ? (
            <h1 className="text-2xl font-bold text-blue-600 text-center">R</h1>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-blue-600">Riventa</h1>
              <p className="text-sm text-gray-500 mt-1">Social + News</p>
            </>
          )}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mb-6 ${isSearchOpen ? 'flex items-center justify-center' : ''}`}
        >
          {isSearchOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          ) : (
            'Criar Post'
          )}
        </button>

        {/* Navigation Buttons */}
        <nav className="space-y-2">
          {/* Home */}
          <button
            onClick={() => router.push('/')}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
              isActive('/') 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">🏠</span>
            {!isSearchOpen && <span>Home</span>}
          </button>

          {/* Buscar */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
              isSearchOpen
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">🔍</span>
            {!isSearchOpen && <span>Buscar</span>}
          </button>

          {/* Mensagens */}
          <button
            onClick={() => {}}
            className="w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-gray-700 hover:bg-gray-100"
          >
            <span className="text-xl">💬</span>
            {!isSearchOpen && <span>Mensagens</span>}
          </button>

          {/* Perfil */}
          <button
            onClick={() => {
              if (userId) {
                router.push(`/u/${userId}`);
              } else {
                router.push('/api/auth/signin');
              }
            }}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
              isActive(/^\/u\/[^/]+$/)
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">👤</span>
            {!isSearchOpen && <span>Perfil</span>}
          </button>

          {/* NewsExplorer */}
          <button
            onClick={() => router.push('/news')}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
              isActive('/news')
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">📰</span>
            {!isSearchOpen && <span>NewsExplorer</span>}
          </button>
        </nav>

        {/* Informações do usuário */}
        {!isSearchOpen && (
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
        )}
      </aside>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
      />

      <SearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

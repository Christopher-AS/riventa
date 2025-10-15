'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';

interface CategoryItem {
  id: string;
  label: string;
  emoji: string;
  type: 'home' | 'category' | 'country';
  value?: string;
}

const categories: CategoryItem[] = [
  { id: 'home', label: 'Início', emoji: '🏠', type: 'home' },
  { id: 'general', label: 'Principais', emoji: '⭐', type: 'category', value: 'general' },
  { id: 'business', label: 'Finanças', emoji: '💰', type: 'category', value: 'business' },
  { id: 'technology', label: 'Tech', emoji: '💻', type: 'category', value: 'technology' },
  { id: 'br', label: 'Brasil', emoji: '🇧🇷', type: 'country', value: 'br' },
  { id: 'us', label: 'Mundo', emoji: '🌍', type: 'country', value: 'us' },
  { id: 'sports', label: 'Sports', emoji: '⚽', type: 'category', value: 'sports' },
  { id: 'entertainment', label: 'Entretenimento', emoji: '🎬', type: 'category', value: 'entertainment' },
  { id: 'health', label: 'Saúde', emoji: '🏥', type: 'category', value: 'health' },
  { id: 'science', label: 'Ciência', emoji: '🔬', type: 'category', value: 'science' },
];

export default function NewsSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isActive = (item: CategoryItem): boolean => {
    if (item.type === 'home') {
      return pathname === '/news' && !searchParams.get('category') && !searchParams.get('country');
    }
    if (item.type === 'category') {
      return searchParams.get('category') === item.value;
    }
    if (item.type === 'country') {
      return searchParams.get('country') === item.value;
    }
    return false;
  };

  const handleNavigation = (item: CategoryItem) => {
    if (item.type === 'home') {
      router.push('/news');
    } else if (item.type === 'category') {
      router.push(`/news?category=${item.value}`);
    } else if (item.type === 'country') {
      router.push(`/news?country=${item.value}`);
    }
  };

  const handleBackToSocial = () => {
    router.push('/');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-3">NewsExplorer</h1>
        <button
          onClick={handleBackToSocial}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Voltar para o feed social"
        >
          <span>←</span>
          <span>Social</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3" role="navigation" aria-label="Categorias de notícias">
        <ul className="space-y-1">
          {categories.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                    ${
                      active
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="text-lg" role="img" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

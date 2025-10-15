'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { 
  Newspaper, 
  Home, 
  Star, 
  Banknote, 
  Cpu, 
  Flag, 
  Sprout, 
  Globe, 
  Trophy, 
  Clapperboard,
  Rocket
} from 'lucide-react';

interface CategoryItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'home' | 'category' | 'country';
  value?: string;
}

const categories: CategoryItem[] = [
  { id: 'home', label: 'Início', icon: Home, type: 'home' },
  { id: 'general', label: 'Principais', icon: Star, type: 'category', value: 'general' },
  { id: 'business', label: 'Finanças', icon: Banknote, type: 'category', value: 'business' },
  { id: 'technology', label: 'Tech', icon: Cpu, type: 'category', value: 'technology' },
  { id: 'br', label: 'Brasil', icon: Flag, type: 'country', value: 'br' },
  { id: 'agro', label: 'Agro', icon: Sprout, type: 'category', value: 'agro' },
  { id: 'us', label: 'Mundo', icon: Globe, type: 'country', value: 'us' },
  { id: 'sports', label: 'Sports', icon: Trophy, type: 'category', value: 'sports' },
  { id: 'entertainment', label: 'Entretenimento', icon: Clapperboard, type: 'category', value: 'entertainment' },
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
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-900">NewsExplorer</h1>
        </div>
        
        <button
          onClick={handleBackToSocial}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2 w-full flex items-center justify-center gap-2 transition"
          aria-label="Voltar para Riventa Social"
        >
          <Rocket className="w-4 h-4" />
          <span>Riventa Social</span>
        </button>
      </div>

      <nav className="flex-1 px-3 py-6" role="navigation" aria-label="Categorias de notícias">
        <div className="mb-3 px-3">
          <h2 className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
            Categorias
          </h2>
        </div>
        
        <ul className="space-y-2">
          {categories.map((item) => {
            const active = isActive(item);
            const IconComponent = item.icon;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${
                      active
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
                    }
                  `}
                  aria-current={active ? 'page' : undefined}
                >
                  <IconComponent className="w-5 h-5" />
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

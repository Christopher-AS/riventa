export const dynamic = "force-dynamic";

type NewsArticle = {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
};

type NewsResponse = {
  articles: NewsArticle[];
};

const CATEGORIES = [
  { id: "general", label: "Início" },
  { id: "technology", label: "Tecnologia" },
  { id: "business", label: "Negócios" },
  { id: "entertainment", label: "Entretenimento" },
  { id: "health", label: "Saúde" },
  { id: "science", label: "Ciência" },
  { id: "sports", label: "Esportes" },
];

const COUNTRIES = [
  { id: "br", label: "Brasil" },
  { id: "us", label: "Mundo" },
];

async function fetchNews(category?: string, country?: string): Promise<NewsResponse | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const params = new URLSearchParams();
    
    if (category) params.set("category", category);
    if (country) params.set("country", country);
    
    const queryString = params.toString();
    const url = `${baseUrl}/api/news${queryString ? `?${queryString}` : ""}`;
    
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Erro ao buscar notícias:", res.status);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return null;
  }
}

function getPageTitle(category?: string, country?: string): string {
  if (category) {
    const cat = CATEGORIES.find((c) => c.id === category);
    return `NewsExplorer — ${cat?.label || category}`;
  }
  
  if (country) {
    const cnt = COUNTRIES.find((c) => c.id === country);
    return `NewsExplorer — ${cnt?.label || country}`;
  }
  
  return "NewsExplorer — Início";
}

function NewsSidebar({
  currentCategory,
  currentCountry,
}: {
  currentCategory?: string;
  currentCountry?: string;
}) {
  return (
    <aside className="w-64 flex-shrink-0 space-y-6">
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Categorias</h2>
        <nav className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.id || (!currentCategory && cat.id === "general");
            const href = cat.id === "general" ? "/news" : `/news?category=${cat.id}`;
            
            return (
              <a
                key={cat.id}
                href={href}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 font-medium text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </a>
            );
          })}
        </nav>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Região</h2>
        <nav className="space-y-1">
          {COUNTRIES.map((country) => {
            const isActive = currentCountry === country.id;
            const href = `/news?country=${country.id}`;
            
            return (
              <a
                key={country.id}
                href={href}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 font-medium text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {country.label}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function NewsCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex gap-4">
        <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-gray-200"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
          <div className="h-3 w-full rounded bg-gray-200"></div>
          <div className="h-3 w-5/6 rounded bg-gray-200"></div>
          <div className="h-3 w-1/4 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const date = new Date(article.publishedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-4"
      >
        {article.urlToImage && (
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={article.urlToImage}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {article.title}
          </h3>
          {article.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {article.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium">{article.source.name}</span>
            <span>•</span>
            <time dateTime={article.publishedAt}>{date}</time>
          </div>
        </div>
      </a>
    </article>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: { category?: string; country?: string };
}) {
  const { category, country } = searchParams;
  const pageTitle = getPageTitle(category, country);

  const newsData = await fetchNews(category, country);

  return (
    <div className="flex gap-8">
      <NewsSidebar currentCategory={category} currentCountry={country} />

      <main role="main" className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>

        {!newsData ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">
                Erro ao carregar notícias. Por favor, tente novamente.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : newsData.articles.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">
              Nenhuma notícia encontrada para este filtro.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {newsData.articles.map((article, index) => (
              <NewsCard key={`${article.url}-${index}`} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

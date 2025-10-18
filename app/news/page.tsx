"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NewsSidebar from "@/components/news/NewsSidebar";
import { Newspaper } from "lucide-react";

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
  const cleanTitle = article.title.replace(/\s*-\s*[^-]+$/, '').trim();
  
  const date = new Date(article.publishedAt).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
      <Link
        href={`/news/${encodeURIComponent(article.title)}`}
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
            {cleanTitle}
          </h3>
          {article.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {article.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <time dateTime={article.publishedAt}>{date}</time>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: { category?: string; country?: string };
}) {
  const { category, country } = searchParams;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (country) params.set("country", country);
        
        const queryString = params.toString();
        const url = `/api/news${queryString ? `?${queryString}` : ""}`;
        
        const res = await fetch(url, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Erro ao buscar notícias: ${res.status}`);
        }

        const data: NewsResponse = await res.json();
        setArticles(data.articles ?? []);
      } catch (err) {
        console.error("Erro ao buscar notícias:", err);
        setError("Erro ao carregar notícias. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [category, country]);

  return (
    <div className="flex gap-8">
      <NewsSidebar />

      <main role="main" className="flex-1 space-y-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Newspaper className="h-6 w-6" />
          NewsExplorer
        </h1>

        {loading ? (
          <div className="space-y-4">
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">
              Nenhuma notícia encontrada para este filtro.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <NewsCard key={`${article.url}-${index}`} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

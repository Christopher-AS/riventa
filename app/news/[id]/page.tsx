"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SourceBadge from "@/components/news/SourceBadge";

type NewsArticle = {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
  source: {
    name: string;
  };
  sources?: Array<{ name: string; url: string }>;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function NewsDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticle() {
      try {
        const { id } = await params;
        const response = await fetch(`/api/news/${encodeURIComponent(id)}`);
        const data = await response.json();

        if (!response.ok || !data.ok) {
          setError(data.error || "Erro ao carregar notícia");
          return;
        }

        console.log('Fontes recebidas:', data.article.sources);
        setArticle(data.article);
      } catch (err) {
        console.error("Erro ao carregar notícia:", err);
        setError("Erro ao carregar notícia");
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notícia...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-600 mb-4">{error || "Notícia não encontrada"}</p>
          <button
            onClick={() => router.push("/news")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Notícias
          </button>
        </div>
      </div>
    );
  }

  // Processa o conteúdo em parágrafos
  const contentParagraphs = article.content
    ? article.content.split(/\n+/).filter((p) => p.trim().length > 0)
    : [article.description];

  const publishedDate = new Date(article.publishedAt).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Botão Voltar */}
        <button
          onClick={() => router.push("/news")}
          className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        {/* Data de Publicação */}
        <div className="text-sm text-gray-600 mb-6">{publishedDate}</div>

        {/* Imagem Hero */}
        {article.urlToImage && (
          <div className="mb-8">
            <img
              src={article.urlToImage}
              alt={article.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Conteúdo */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            {contentParagraphs.map((paragraph, index) => (
              <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                {paragraph} <SourceBadge sources={article.sources || [{name: article.source.name, url: article.url}]} />
              </p>
            ))}
          </div>
        </div>

        {/* Botão Voltar (rodapé) */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/news")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Notícias
          </button>
        </div>
      </div>
    </div>
  );
}

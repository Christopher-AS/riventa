import { NextRequest, NextResponse } from "next/server";

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
};

type NewsAPIResponse = {
  status: string;
  articles: NewsArticle[];
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsApiKey = process.env.NEWS_API_KEY;

    if (!newsApiKey) {
      return NextResponse.json(
        { ok: false, error: "NEWS_API_KEY não configurada" },
        { status: 500 }
      );
    }

    // Decodifica o ID que pode ser um título codificado
    const decodedId = decodeURIComponent(id);

    // Busca notícias recentes e tenta encontrar a correspondente
    const url = `https://newsapi.org/v2/top-headlines?country=br&apiKey=${newsApiKey}&pageSize=100`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache por 5 minutos
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: "Erro ao buscar notícia" },
        { status: response.status }
      );
    }

    const data: NewsAPIResponse = await response.json();

    // Encontra a notícia pelo título
    const article = data.articles.find(
      (a) => a.title === decodedId || a.url.includes(decodedId)
    );

    if (!article) {
      return NextResponse.json(
        { ok: false, error: "Notícia não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      article,
    });
  } catch (error) {
    console.error("Erro ao buscar notícia:", error);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

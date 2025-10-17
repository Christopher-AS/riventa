import { NextRequest, NextResponse } from "next/server";

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

type NewsAPIResponse = {
  status: string;
  articles: NewsArticle[];
};

// Whitelist de valores válidos
const VALID_CATEGORIES = new Set([
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology",
]);

const VALID_COUNTRIES = new Set(["br", "us"]);

export async function GET(request: NextRequest) {
  console.log('[PERF] API News: Início:', new Date().toISOString());
  
  try {
    const newsApiKey = process.env.NEWS_API_KEY;

    if (!newsApiKey) {
      return NextResponse.json(
        { ok: false, error: "NEWS_API_KEY não configurada" },
        { status: 500 }
      );
    }

    // 1. Ler e validar query params
    const searchParams = request.nextUrl.searchParams;
    const categoryParam = searchParams.get("category");
    const countryParam = searchParams.get("country");

    // Validar category (ignorar se inválido)
    const category =
      categoryParam && VALID_CATEGORIES.has(categoryParam)
        ? categoryParam
        : null;

    // Validar country (ignorar se inválido)
    const country =
      countryParam && VALID_COUNTRIES.has(countryParam) ? countryParam : null;

    console.log('[PERF] API News: Params validados:', new Date().toISOString());

    // 2. Determinar quais países buscar
    const countriesToFetch: string[] = country ? [country] : ["br", "us"];

    // 3. Construir URLs de busca
    const fetchPromises = countriesToFetch.map((countryCode) => {
      let url = `https://newsapi.org/v2/top-headlines?country=${countryCode}&pageSize=5`;

      // Adicionar categoria se fornecida
      if (category) {
        url += `&category=${category}`;
      }

      return fetch(url, {
        headers: {
          "X-Api-Key": newsApiKey,
        },
      });
    });

    console.log('[PERF] API News: Buscando NewsAPI...', new Date().toISOString());

    // 4. Buscar notícias em paralelo
    const newsResponses = await Promise.all(fetchPromises);

    console.log('[PERF] API News: NewsAPI concluído:', new Date().toISOString());

    // 5. Validar respostas
    for (let i = 0; i < newsResponses.length; i++) {
      if (!newsResponses[i].ok) {
        throw new Error(
          `NewsAPI error for ${countriesToFetch[i]}: ${newsResponses[i].status}`
        );
      }
    }

    // 6. Parsear JSON de todas as respostas
    const newsDataArray: NewsAPIResponse[] = await Promise.all(
      newsResponses.map((res) => res.json())
    );

    // 7. Mesclar artigos de todos os países
    const allArticles = newsDataArray.flatMap((data) => data.articles || []);

    // 8. Deduplicar artigos por URL
    const seenUrls = new Set<string>();
    const uniqueArticles = allArticles.filter((article) => {
      if (seenUrls.has(article.url)) {
        return false;
      }
      seenUrls.add(article.url);
      return true;
    });

    if (uniqueArticles.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "Nenhuma notícia encontrada",
      });
    }

    // 9. Mapear artigos para o formato de resposta
    const articles = uniqueArticles.map((article) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: {
        name: article.source.name,
      },
    }));

    console.log('[PERF] API News: Fim:', new Date().toISOString());

    // 10. Retornar resposta estruturada
    return NextResponse.json({
      articles: articles,
    });
  } catch (err: any) {
    console.error("GET /api/news error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "erro inesperado" },
      { status: 500 }
    );
  }
}

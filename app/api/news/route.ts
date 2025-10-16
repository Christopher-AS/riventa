import { NextRequest, NextResponse } from "next/server";

type NewsArticle = {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  source: {
    name: string;
  };
};

type NewsAPIResponse = {
  status: string;
  articles: NewsArticle[];
};

type ClaudeMessage = {
  role: "user" | "assistant";
  content: string;
};

type ClaudeResponse = {
  content: Array<{
    type: string;
    text: string;
  }>;
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
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!newsApiKey) {
      return NextResponse.json(
        { ok: false, error: "NEWS_API_KEY não configurada" },
        { status: 500 }
      );
    }

    if (!anthropicApiKey) {
      return NextResponse.json(
        { ok: false, error: "ANTHROPIC_API_KEY não configurada" },
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

    // 9. Identificar a imagem mais comum
    const imageCount = new Map<string, number>();

    for (const article of uniqueArticles) {
      if (article.urlToImage) {
        const count = imageCount.get(article.urlToImage) || 0;
        imageCount.set(article.urlToImage, count + 1);
      }
    }

    let mostCommonImage: string | null = null;
    let maxCount = 0;

    for (const [image, count] of imageCount.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonImage = image;
      }
    }

    // Se não houver imagem comum, usar a primeira disponível
    if (!mostCommonImage) {
      const firstWithImage = uniqueArticles.find((a) => a.urlToImage);
      mostCommonImage = firstWithImage?.urlToImage || null;
    }

    // 10. Preparar texto para Claude sintetizar
    const newsTexts = uniqueArticles
      .map((article, idx) => {
        return `Notícia ${idx + 1}:\nTítulo: ${article.title}\nDescrição: ${article.description || "N/A"}`;
      })
      .join("\n\n");

    const prompt = `Sintetize estas notícias em 2 parágrafos curtos com HTML <p>. Seja direto e conciso.

${newsTexts}`;

    console.log('[PERF] API News: Chamando Claude...', new Date().toISOString());

    // 11. Chamar Claude API
    const claudeResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      throw new Error(
        `Claude API error: ${claudeResponse.status} - ${errorText}`
      );
    }

    const claudeData: ClaudeResponse = await claudeResponse.json();

    console.log('[PERF] API News: Claude concluído:', new Date().toISOString());

    const synthesizedContent =
      claudeData.content?.[0]?.text ||
      "<p>Não foi possível sintetizar o conteúdo.</p>";

    // 12. Preparar sources
    const sources = uniqueArticles.map((article) => ({
      name: article.source.name,
      url: article.url,
    }));

    // 13. Gerar título e subtítulo (usar o título da primeira notícia como base)
    const mainTitle =
      uniqueArticles[0]?.title || "Notícias do Brasil e EUA";
    const subtitle =
      uniqueArticles[0]?.description || "Resumo das principais notícias";

    console.log('[PERF] API News: Fim:', new Date().toISOString());

    // 14. Retornar resposta estruturada
    return NextResponse.json({
      ok: true,
      title: mainTitle,
      subtitle: subtitle,
      imageUrl: mostCommonImage,
      content: synthesizedContent,
      sources: sources,
    });
  } catch (err: any) {
    console.error("GET /api/news error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "erro inesperado" },
      { status: 500 }
    );
  }
}

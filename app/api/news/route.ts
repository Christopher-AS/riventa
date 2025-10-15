import { NextResponse } from "next/server";

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

export async function GET() {
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

    // 1. Buscar notícias do Brasil e EUA em paralelo
    const newsUrlBR = "https://newsapi.org/v2/top-headlines?country=br&pageSize=10";
    const newsUrlUS = "https://newsapi.org/v2/top-headlines?country=us&pageSize=10";

    const [newsResponseBR, newsResponseUS] = await Promise.all([
      fetch(newsUrlBR, {
        headers: {
          "X-Api-Key": newsApiKey,
        },
      }),
      fetch(newsUrlUS, {
        headers: {
          "X-Api-Key": newsApiKey,
        },
      }),
    ]);

    if (!newsResponseBR.ok) {
      throw new Error(`NewsAPI BR error: ${newsResponseBR.status}`);
    }

    if (!newsResponseUS.ok) {
      throw new Error(`NewsAPI US error: ${newsResponseUS.status}`);
    }

    const newsDataBR: NewsAPIResponse = await newsResponseBR.json();
    const newsDataUS: NewsAPIResponse = await newsResponseUS.json();

    // 2. Mesclar os artigos dos dois países
    const allArticles = [
      ...(newsDataBR.articles || []),
      ...(newsDataUS.articles || []),
    ];

    if (allArticles.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "Nenhuma notícia encontrada",
      });
    }

    // 3. Identificar a imagem mais comum
    const imageCount = new Map<string, number>();
    
    for (const article of allArticles) {
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
      const firstWithImage = allArticles.find((a) => a.urlToImage);
      mostCommonImage = firstWithImage?.urlToImage || null;
    }

    // 4. Preparar texto para Claude sintetizar
    const newsTexts = allArticles
      .map((article, idx) => {
        return `Notícia ${idx + 1}:\nTítulo: ${article.title}\nDescrição: ${article.description || "N/A"}`;
      })
      .join("\n\n");

    const prompt = `Você receberá várias notícias recentes do Brasil e dos Estados Unidos. Analise-as e sintetize o tema principal em 3-4 parágrafos conexos e informativos. Use HTML com tags <p> para cada parágrafo. Seja objetivo e jornalístico.

${newsTexts}

Responda APENAS com os parágrafos em HTML, sem introduções ou comentários adicionais.`;

    // 5. Chamar Claude API
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      throw new Error(`Claude API error: ${claudeResponse.status} - ${errorText}`);
    }

    const claudeData: ClaudeResponse = await claudeResponse.json();

    const synthesizedContent =
      claudeData.content?.[0]?.text || "<p>Não foi possível sintetizar o conteúdo.</p>";

    // 6. Preparar sources
    const sources = allArticles.map((article) => ({
      name: article.source.name,
      url: article.url,
    }));

    // 7. Gerar título e subtítulo (usar o título da primeira notícia como base)
    const mainTitle = allArticles[0]?.title || "Notícias do Brasil e EUA";
    const subtitle = allArticles[0]?.description || "Resumo das principais notícias";

    // 8. Retornar resposta estruturada
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

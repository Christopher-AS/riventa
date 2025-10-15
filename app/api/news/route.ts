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

    // 1. Buscar notícias do NewsAPI
    const newsUrl = "https://newsapi.org/v2/top-headlines?country=br&pageSize=10";
    const newsResponse = await fetch(newsUrl, {
      headers: {
        "X-Api-Key": newsApiKey,
      },
    });

    if (!newsResponse.ok) {
      throw new Error(`NewsAPI error: ${newsResponse.status}`);
    }

    const newsData: NewsAPIResponse = await newsResponse.json();

    if (!newsData.articles || newsData.articles.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "Nenhuma notícia encontrada",
      });
    }

    // 2. Identificar a imagem mais comum
    const imageCount = new Map<string, number>();
    
    for (const article of newsData.articles) {
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
      const firstWithImage = newsData.articles.find((a) => a.urlToImage);
      mostCommonImage = firstWithImage?.urlToImage || null;
    }

    // 3. Preparar texto para Claude sintetizar
    const newsTexts = newsData.articles
      .map((article, idx) => {
        return `Notícia ${idx + 1}:\nTítulo: ${article.title}\nDescrição: ${article.description || "N/A"}`;
      })
      .join("\n\n");

    const prompt = `Você receberá várias notícias recentes do Brasil. Analise-as e sintetize o tema principal em 3-4 parágrafos conexos e informativos. Use HTML com tags <p> para cada parágrafo. Seja objetivo e jornalístico.

${newsTexts}

Responda APENAS com os parágrafos em HTML, sem introduções ou comentários adicionais.`;

    // 4. Chamar Claude API
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

    // 5. Preparar sources
    const sources = newsData.articles.map((article) => ({
      name: article.source.name,
      url: article.url,
    }));

    // 6. Gerar título e subtítulo (usar o título da primeira notícia como base)
    const mainTitle = newsData.articles[0]?.title || "Notícias do Brasil";
    const subtitle = newsData.articles[0]?.description || "Resumo das principais notícias";

    // 7. Retornar resposta estruturada
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

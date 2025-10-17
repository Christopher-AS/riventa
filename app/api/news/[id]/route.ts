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
    console.log('[DEBUG] Buscando:', decodedId);

    console.log("[PERF] Buscando notícias da NewsAPI...");
    const startNewsApi = Date.now();

    // Busca notícias de AMBOS países: br e us
    const urlBr = `https://newsapi.org/v2/top-headlines?country=br&apiKey=${newsApiKey}&pageSize=100`;
    const urlUs = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsApiKey}&pageSize=100`;
    
    const [responseBr, responseUs] = await Promise.all([
      fetch(urlBr, { next: { revalidate: 300 } }),
      fetch(urlUs, { next: { revalidate: 300 } }),
    ]);

    console.log(`[PERF] NewsAPI respondeu em ${Date.now() - startNewsApi}ms`);

    if (!responseBr.ok || !responseUs.ok) {
      return NextResponse.json(
        { ok: false, error: "Erro ao buscar notícia" },
        { status: responseBr.ok ? responseUs.status : responseBr.status }
      );
    }

    const dataBr: NewsAPIResponse = await responseBr.json();
    const dataUs: NewsAPIResponse = await responseUs.json();

    // Combina todos os artigos em um único array
    const allArticles = [...dataBr.articles, ...dataUs.articles];

    console.log('[DEBUG] Títulos disponíveis:', allArticles.map(a => a.title));

    // Encontra a notícia pelo título OU URL
    const article = allArticles.find(
      (a) => a.title === decodedId || a.url.includes(decodedId)
    );

    if (!article) {
      return NextResponse.json(
        { ok: false, error: "Notícia não encontrada" },
        { status: 404 }
      );
    }

    // Sintetizar conteúdo com Claude
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      console.warn("[PERF] ANTHROPIC_API_KEY não configurada, retornando conteúdo original");
      return NextResponse.json({
        ok: true,
        article,
      });
    }

    console.log("[PERF] Chamando Claude API para sintetizar conteúdo...");
    const startClaude = Date.now();

    const prompt = `Sintetize esta notícia em 3-4 parágrafos informativos com HTML <p>. Título: ${article.title}. Descrição: ${article.description}. Conteúdo: ${article.content}`;

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    console.log(`[PERF] Claude API respondeu em ${Date.now() - startClaude}ms`);

    if (!claudeResponse.ok) {
      console.error("[PERF] Erro ao chamar Claude API:", await claudeResponse.text());
      return NextResponse.json({
        ok: true,
        article,
      });
    }

    const claudeData = await claudeResponse.json();
    const synthesizedContent = claudeData.content?.[0]?.text || article.content;

    console.log(`[PERF] Conteúdo sintetizado com sucesso (${synthesizedContent.length} caracteres)`);

    return NextResponse.json({
      ok: true,
      article: {
        ...article,
        content: synthesizedContent,
      },
    });
  } catch (error) {
    console.error("[PERF] Erro ao buscar notícia:", error);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

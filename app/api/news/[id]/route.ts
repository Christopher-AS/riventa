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

// Função para encontrar artigos similares baseado em palavras-chave do título
function getSimilarArticles(mainArticle: NewsArticle, allArticles: NewsArticle[]): NewsArticle[] {
  // Extrai palavras do título principal (mínimo 4 letras)
  const mainWords = mainArticle.title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length >= 4)
    .map(word => word.replace(/[^\w]/g, '')); // Remove pontuação

  console.log('[DEBUG] Buscando similares com palavras:', mainWords);
  console.log('[DEBUG] Palavras-chave do artigo principal:', mainWords);

  const similarArticles: Array<{ article: NewsArticle; commonWords: number }> = [];

  for (const article of allArticles) {
    // Não incluir o próprio artigo principal
    if (article.url === mainArticle.url || article.title === mainArticle.title) {
      continue;
    }

    // Extrai palavras do título do artigo candidato
    const candidateWords = article.title
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length >= 4)
      .map(word => word.replace(/[^\w]/g, ''));

    // Conta palavras em comum
    const commonWords = mainWords.filter(word => candidateWords.includes(word)).length;

    // Se tem 3 ou mais palavras em comum, é similar
    if (commonWords >= 3) {
      similarArticles.push({ article, commonWords });
    }
  }

  // Ordena por número de palavras em comum (mais similar primeiro)
  similarArticles.sort((a, b) => b.commonWords - a.commonWords);

  console.log(`[DEBUG] Encontrados ${similarArticles.length} artigos com 3+ palavras em comum`);

  // Se não encontrou pelo menos 3 artigos, tenta com 2 palavras em comum
  if (similarArticles.length < 3) {
    console.log('[DEBUG] Menos de 3 artigos encontrados, tentando com 2 palavras em comum...');
    
    for (const article of allArticles) {
      // Não incluir o próprio artigo principal
      if (article.url === mainArticle.url || article.title === mainArticle.title) {
        continue;
      }

      // Pula se já está na lista
      if (similarArticles.some(item => item.article.url === article.url)) {
        continue;
      }

      // Extrai palavras do título do artigo candidato
      const candidateWords = article.title
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length >= 4)
        .map(word => word.replace(/[^\w]/g, ''));

      // Conta palavras em comum
      const commonWords = mainWords.filter(word => candidateWords.includes(word)).length;

      // Se tem 2 ou mais palavras em comum, adiciona
      if (commonWords >= 2) {
        similarArticles.push({ article, commonWords });
      }
    }

    // Reordena incluindo os novos artigos
    similarArticles.sort((a, b) => b.commonWords - a.commonWords);
    console.log(`[DEBUG] Após busca com 2 palavras: ${similarArticles.length} artigos`);
  }

  // Se ainda não tem pelo menos 3, pega os 5 mais recentes
  if (similarArticles.length < 3) {
    console.log('[DEBUG] Ainda menos de 3 artigos, pegando os 5 mais recentes...');
    
    const recentArticles = allArticles
      .filter(article => 
        article.url !== mainArticle.url && 
        article.title !== mainArticle.title &&
        !similarArticles.some(item => item.article.url === article.url)
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5)
      .map(article => ({ article, commonWords: 0 }));

    similarArticles.push(...recentArticles);
    console.log(`[DEBUG] Após adicionar recentes: ${similarArticles.length} artigos`);
  }

  // Retorna até 10 artigos similares
  const result = similarArticles.slice(0, 10).map(item => item.article);
  
  console.log(`[DEBUG] Encontrados ${result.length} artigos similares`);
  console.log('[DEBUG] Artigos similares:', result.length);
  console.log('[DEBUG] Sources retornadas:', result.map(a => a.source.name));
  
  return result;
}

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

    // Decodifica o ID que pode ser um título codificado (DUPLO encoding)
    const decodedId = decodeURIComponent(decodeURIComponent(id));
    const cleanDecodedId = decodedId.replace(/\s*-\s*[^-]+$/, '').trim();
    console.log('[DEBUG] ID limpo para busca:', cleanDecodedId);
    console.log('[DEBUG] ID decodificado:', decodedId);
    console.log('[DEBUG] Buscando título exato ou URL contendo:', decodedId.substring(0, 50));

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
    let allArticles = [...dataBr.articles, ...dataUs.articles];

    // Limpa títulos removendo ' - Fonte' do final
    allArticles = allArticles.map(a => ({...a, title: a.title.replace(/\s*-\s*[^-]+$/, '').trim()}));

    console.log('[DEBUG] Total de artigos disponíveis:', allArticles.length);
    console.log('[DEBUG] Primeiros 3 títulos:', allArticles.slice(0, 3).map(a => a.title));
    console.log('[DEBUG] Títulos disponíveis:', allArticles.map(a => a.title));

    // Encontra a notícia pelo título OU URL
    const article = allArticles.find(
      (a) => a.title === cleanDecodedId || 
             a.title.toLowerCase().includes(cleanDecodedId.toLowerCase()) ||
             a.url.includes(decodedId)
    );

    if (!article) {
      console.log('[DEBUG] NÃO ENCONTRADO! Título buscado:', cleanDecodedId);
      console.log('[DEBUG] Tentando busca parcial...');
      return NextResponse.json(
        { ok: false, error: "Notícia não encontrada" },
        { status: 404 }
      );
    }

    // Busca artigos similares
    const similarArticles = getSimilarArticles(article, allArticles);
    
    // Junta artigo principal + similares
    const allRelatedArticles = [article, ...similarArticles];
    
    console.log(`[DEBUG] Total de artigos para síntese: ${allRelatedArticles.length}`);

    // Sintetizar conteúdo com Claude
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      console.warn("[PERF] ANTHROPIC_API_KEY não configurada, retornando conteúdo original");
      return NextResponse.json({
        ok: true,
        article: {
          ...article,
          sources: similarArticles.map(a => ({
            name: a.source.name,
            url: a.url
          }))
        },
      });
    }

    console.log("[PERF] Chamando Claude API para sintetizar conteúdo...");
    const startClaude = Date.now();

    // Monta lista de fontes para o prompt
    const sourcesList = allRelatedArticles
      .map((a, idx) => `${idx + 1}. ${a.source.name}: "${a.title}"\n   ${a.description || 'Sem descrição'}`)
      .join('\n\n');

    const prompt = `Sintetize estas ${allRelatedArticles.length} fontes sobre ${article.title} em 4 parágrafos informativos em texto puro (sem tags HTML). Separe parágrafos com dupla quebra de linha. Fontes:\n\n${sourcesList}`;

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
        article: {
          ...article,
          sources: similarArticles.map(a => ({
            name: a.source.name,
            url: a.url
          }))
        },
      });
    }

    const claudeData = await claudeResponse.json();
    const synthesizedContent = claudeData.content?.[0]?.text || article.content;

    console.log(`[PERF] Conteúdo sintetizado com sucesso (${synthesizedContent.length} caracteres)`);

    // Traduzir título, descrição e conteúdo sintetizado
    console.log("[PERF] Chamando Claude API para traduzir conteúdo...");
    const startTranslate = Date.now();

    const translateResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Traduza para português (pt-BR):\n\nTítulo: ${article.title}\n\nDescrição: ${article.description || ''}\n\nConteúdo: ${synthesizedContent}`
        }]
      })
    });

    console.log(`[PERF] Tradução respondeu em ${Date.now() - startTranslate}ms`);

    let translatedTitle = article.title;
    let translatedDescription = article.description;
    let translatedContent = synthesizedContent;

    if (translateResponse.ok) {
      const translateData = await translateResponse.json();
      const translatedText = translateData.content?.[0]?.text || '';
      
      // Extrair título, descrição e conteúdo traduzidos
      const titleMatch = translatedText.match(/Título:\s*(.+?)(?:\n\n|$)/);
      const descriptionMatch = translatedText.match(/Descrição:\s*(.+?)(?:\n\n|$)/);
      const contentMatch = translatedText.match(/Conteúdo:\s*([\s\S]+)$/);

      if (titleMatch) translatedTitle = titleMatch[1].trim();
      if (descriptionMatch) translatedDescription = descriptionMatch[1].trim();
      if (contentMatch) translatedContent = contentMatch[1].trim();

      console.log(`[PERF] Conteúdo traduzido com sucesso`);
    } else {
      console.error("[PERF] Erro ao traduzir conteúdo:", await translateResponse.text());
    }

    return NextResponse.json({
      ok: true,
      article: {
        ...article,
        title: translatedTitle,
        description: translatedDescription,
        content: translatedContent,
        sources: similarArticles.map(a => ({
          name: a.source.name,
          url: a.url
        }))
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

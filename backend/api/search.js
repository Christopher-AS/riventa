// API Serverless para Vercel - Adaptado do seu código existente
import { apiConfig } from '../config/apis.js';

// Simulação do SourceManager para Vercel
class SourceManager {
  constructor() {
    this.enabledSources = [
      { id: 'hackernews', name: 'Hacker News', weight: 0.8 },
      { id: 'devto', name: 'Dev.to', weight: 0.7 },
      { id: 'github', name: 'GitHub', weight: 0.6 }
    ];
  }

  async searchAll(query) {
    const results = [];
    
    try {
      // Buscar no Hacker News
      const hnResponse = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=5`);
      if (hnResponse.ok) {
        const hnData = await hnResponse.json();
        hnData.hits.forEach(hit => {
          results.push({
            title: hit.title,
            url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            snippet: hit.story_text || hit.comment_text || 'Discussão no Hacker News',
            source_name: 'Hacker News',
            published_at: hit.created_at,
            points: hit.points || 0
          });
        });
      }
    } catch (error) {
      console.log('Erro no Hacker News:', error.message);
    }

    try {
      // Buscar no Dev.to
      const devResponse = await fetch(`https://dev.to/api/articles?tag=${encodeURIComponent(query)}&per_page=3`);
      if (devResponse.ok) {
        const devData = await devResponse.json();
        devData.forEach(article => {
          results.push({
            title: article.title,
            url: article.url,
            snippet: article.description || article.title,
            source_name: 'Dev.to',
            published_at: article.published_at,
            reactions: article.public_reactions_count || 0
          });
        });
      }
    } catch (error) {
      console.log('Erro no Dev.to:', error.message);
    }

    return results.slice(0, 10);
  }
}

// Cache simples em memória
const cache = new Map();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Parâmetro q (query) obrigatório' });
    }

    try {
      console.log('Buscando:', q);
      
      // Verificar cache
      const cacheKey = `search_${q.toLowerCase()}`;
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 300000) { // 5 minutos
          return res.status(200).json({
            ...cached.data,
            fromCache: true
          });
        }
      }

      // Buscar em fontes externas
      const sourceManager = new SourceManager();
      const results = await sourceManager.searchAll(q);
      
      // Processar resultados
      const processed = {
        query: q,
        count: results.length,
        results: results.map(item => ({
          id: Math.random().toString(36).substr(2, 9),
          title: item.title || 'Sem título',
          url: item.url || '#',
          snippet: item.snippet || 'Sem descrição',
          site_name: item.source_name || 'Fonte desconhecida',
          published_at: item.published_at || new Date().toISOString(),
          lang: 'pt',
          topics: extractTopics(item.title + ' ' + (item.snippet || ''))
        }))
      };

      // Salvar no cache
      cache.set(cacheKey, {
        data: processed,
        timestamp: Date.now()
      });
      
      return res.status(200).json({
        ...processed,
        fromCache: false
      });
      
    } catch (error) {
      console.error('Erro na busca:', error);
      return res.status(500).json({ 
        error: 'Erro na busca',
        message: error.message 
      });
    }
  }

  return res.status(404).json({ error: 'Método não permitido' });
}

// Função para extrair tópicos
function extractTopics(text) {
  const topics = [];
  const words = text.toLowerCase().split(' ');
  
  if (words.some(w => ['tech', 'tecnologia', 'ai', 'startup'].includes(w))) {
    topics.push('Tecnologia');
  }
  if (words.some(w => ['money', 'dinheiro', 'investimento', 'finance'].includes(w))) {
    topics.push('Finanças');
  }
  if (words.some(w => ['health', 'saúde', 'medicina'].includes(w))) {
    topics.push('Saúde');
  }
  
  return topics.slice(0, 3);
}
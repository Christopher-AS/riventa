// Gerenciador de múltiplas fontes - VERSÃO ROBUSTA
import { apiConfig } from '../../config/apis.js';

export class SourceManager {
  constructor() {
    this.enabledSources = this.getEnabledSources();
  }

  getEnabledSources() {
    const sources = [];
    
    Object.entries(apiConfig.free).forEach(([key, config]) => {
      if (config.enabled) {
        sources.push({ id: key, ...config, type: 'free' });
      }
    });

    Object.entries(apiConfig.premium).forEach(([key, config]) => {
      if (config.enabled && config.key) {
        sources.push({ id: key, ...config, type: 'premium' });
      }
    });

    return sources;
  }

  async searchAll(query) {
    console.log(`🔍 Buscando "${query}" em ${this.enabledSources.length} fontes...`);
    
    const promises = this.enabledSources.map(source => 
      this.searchWithTimeout(source, query)
    );

    const results = await Promise.allSettled(promises);
    return this.processResults(results, query);
  }

  async searchWithTimeout(source, query) {
    const timeout = apiConfig.settings.timeout;
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    );

    try {
      const result = await Promise.race([
        this.searchSource(source, query),
        timeoutPromise
      ]);
      
      return {
        source: source.id,
        name: source.name,
        weight: source.weight,
        data: result,
        success: true
      };
    } catch (error) {
      console.log(`⚠️ Erro em ${source.name}:`, error.message);
      return {
        source: source.id,
        name: source.name,
        weight: source.weight,
        data: null,
        success: false,
        error: error.message
      };
    }
  }

  async searchSource(source, query) {
    const headers = {
      'User-Agent': apiConfig.settings.userAgent,
      'Accept': 'application/json'
    };

    switch (source.id) {
      case 'hackernews':
        return await this.searchHackerNews(query, headers);
      
      case 'devto':
        return await this.searchDevTo(query, headers);
      
      case 'github':
        return await this.searchGitHub(query, headers);
      
      case 'jsonplaceholder':
        return await this.searchTechDemo(query, headers);
      
      default:
        throw new Error(`Fonte não implementada: ${source.id}`);
    }
  }

  // Hacker News (já funcionando)
  async searchHackerNews(query, headers) {
    const url = `${apiConfig.free.hackernews.baseUrl}?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=5`;
    
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    return data.hits.map(hit => ({
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      snippet: hit.story_text || hit.comment_text || 'Discussão no Hacker News',
      published_at: hit.created_at,
      points: hit.points || 0,
      comments: hit.num_comments || 0
    }));
  }

  // Dev.to - Artigos de tecnologia
  async searchDevTo(query, headers) {
    const url = `${apiConfig.free.devto.baseUrl}?tag=${encodeURIComponent(query)}&per_page=5`;
    
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    return data.map(article => ({
      title: article.title,
      url: article.url,
      snippet: article.description || article.title,
      published_at: article.published_at,
      reactions: article.public_reactions_count || 0,
      comments: article.comments_count || 0,
      tags: article.tag_list || []
    }));
  }

  // GitHub - Repositórios e projetos
  async searchGitHub(query, headers) {
    const url = `${apiConfig.free.github.baseUrl}?q=${encodeURIComponent(query)}&sort=stars&per_page=5`;
    
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    return data.items.map(repo => ({
      title: repo.full_name,
      url: repo.html_url,
      snippet: repo.description || 'Repositório no GitHub',
      published_at: repo.created_at,
      stars: repo.stargazers_count || 0,
      language: repo.language,
      topics: repo.topics || []
    }));
  }

  // Demo de conteúdo técnico (simulado)
  async searchTechDemo(query, headers) {
    const url = apiConfig.free.jsonplaceholder.baseUrl;
    
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    // Filtrar posts que tenham relação com a query
    const filtered = data.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.body.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3);

    // Se não encontrar nada, retornar posts relacionados a tech
    if (filtered.length === 0) {
      return data.slice(0, 3).map(post => ({
        title: `Tech Insight: ${post.title}`,
        url: `https://example.com/tech/${post.id}`,
        snippet: `Artigo sobre ${query}: ${post.body.substring(0, 100)}...`,
        published_at: new Date().toISOString(),
        category: 'Technology'
      }));
    }

    return filtered.map(post => ({
      title: `Análise: ${post.title}`,
      url: `https://example.com/article/${post.id}`,
      snippet: post.body.substring(0, 150) + '...',
      published_at: new Date().toISOString(),
      category: 'Research'
    }));
  }

  processResults(results, query) {
    const combined = [];
    let successCount = 0;
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success && result.value.data) {
        successCount++;
        result.value.data.forEach(item => {
          combined.push({
            ...item,
            source_name: result.value.name,
            source_id: result.value.source,
            weight: result.value.weight,
            id: this.generateId()
          });
        });
      }
    });

    console.log(`✅ ${successCount}/${results.length} fontes retornaram dados`);
    
    // Ordenar por peso e relevância
    const sorted = combined.sort((a, b) => {
      if (a.weight !== b.weight) return b.weight - a.weight;
      if (a.points && b.points) return b.points - a.points;
      if (a.stars && b.stars) return b.stars - a.stars;
      if (a.reactions && b.reactions) return b.reactions - a.reactions;
      return 0;
    });

    return sorted.slice(0, apiConfig.settings.maxResults);
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}
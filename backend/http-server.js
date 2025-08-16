// Servidor HTTP para conectar backend com frontend - VERSÃO COMPLETA
import { riventaServer } from './server.js';
import { createServer } from 'http';
import { URL } from 'url';

class HTTPServer {
  constructor(port = 8787) {
    this.port = port;
    this.server = null;
  }

  async start() {
    // Inicializar o backend primeiro
    await riventaServer.start();
    
    // Criar servidor HTTP
    this.server = createServer(async (req, res) => {
      // Configurar CORS para permitir frontend
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      try {
        await this.handleRequest(req, res);
      } catch (error) {
        console.error('Erro na requisição:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Erro interno do servidor',
          message: error.message 
        }));
      }
    });

    // Iniciar servidor
    this.server.listen(this.port, () => {
      console.log(`🌐 Servidor HTTP rodando na porta ${this.port}`);
      console.log(`📡 Frontend pode acessar: http://localhost:${this.port}`);
      console.log('🔗 Endpoints disponíveis:');
      console.log(`   GET  /search?q=termo`);
      console.log(`   POST /summarize`);
      console.log(`   POST /fetch-content`);
      console.log(`   GET  /stats`);
      console.log(`   GET  /health`);
    });
  }

  async handleRequest(req, res) {
    const url = new URL(req.url, `http://localhost:${this.port}`);
    const path = url.pathname;
    const params = url.searchParams;

    console.log(`📥 ${req.method} ${path}`);

    switch (path) {
      case '/search':
        await this.handleSearch(params, res);
        break;
      
      case '/summarize':
        await this.handleSummarize(req, res);
        break;

      case '/fetch-content':
        await this.handleFetchContent(req, res);
        break;
      
      case '/stats':
        this.handleStats(res);
        break;
      
      case '/health':
        this.handleHealth(res);
        break;
      
      default:
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
    }
  }

  // Endpoint de busca
  async handleSearch(params, res) {
    const query = params.get('q');
    
    if (!query) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Parâmetro q (query) obrigatório' }));
      return;
    }

    try {
      const results = await riventaServer.handleSearch(query);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
      
      console.log(`✅ Busca "${query}" retornou ${results.results.length} resultados`);
      
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Erro na busca',
        message: error.message 
      }));
    }
  }

  // Endpoint de resumo
  async handleSummarize(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { query, results } = data;
        
        // Resumo simples por enquanto
        const summary = this.generateSimpleSummary(query, results);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ summary }));
        
        console.log(`📝 Resumo gerado para: ${query}`);
        
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Erro no resumo',
          message: error.message 
        }));
      }
    });
  }

  // Endpoint para buscar conteúdo de páginas
  async handleFetchContent(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { url, title } = data;
        
        if (!url) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'URL obrigatória' }));
          return;
        }

        console.log(`📄 Fazendo fetch do conteúdo: ${url}`);
        
        const content = await this.fetchPageContent(url);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          content: content,
          url: url,
          title: title
        }));
        
        console.log(`✅ Conteúdo extraído com sucesso para: ${title}`);
        
      } catch (error) {
        console.error('Erro ao buscar conteúdo:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Erro ao buscar conteúdo',
          message: error.message 
        }));
      }
    });
  }

  // Método para extrair conteúdo de páginas
  async fetchPageContent(url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      
      // Extrair texto limpo do HTML
      const cleanContent = this.extractTextFromHTML(html, url);
      
      return cleanContent;
      
    } catch (error) {
      console.log(`⚠️ Erro ao fazer fetch de ${url}:`, error.message);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout ao carregar a página');
      }
      
      throw new Error('Não foi possível carregar o conteúdo da página');
    }
  }

  // Método para extrair texto limpo do HTML
  extractTextFromHTML(html, url) {
    try {
      // Remover scripts, styles e comentários
      let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      text = text.replace(/<!--[\s\S]*?-->/g, '');
      
      // Extrair título
      const titleMatch = text.match(/<title[^>]*>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extrair meta description
      const descMatch = text.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
      const description = descMatch ? descMatch[1].trim() : '';
      
      // Tentar extrair conteúdo principal
      let mainContent = '';
      
      // Procurar por tags de conteúdo comuns
      const contentSelectors = [
        /<article[^>]*>([\s\S]*?)<\/article>/gi,
        /<main[^>]*>([\s\S]*?)<\/main>/gi,
        /<div[^>]*class[^>]*content[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*class[^>]*post[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*class[^>]*entry[^>]*>([\s\S]*?)<\/div>/gi
      ];
      
      for (const selector of contentSelectors) {
        const matches = text.match(selector);
        if (matches && matches[0]) {
          mainContent = matches[0];
          break;
        }
      }
      
      // Se não encontrou conteúdo específico, usar o body todo
      if (!mainContent) {
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        mainContent = bodyMatch ? bodyMatch[1] : text;
      }
      
      // Remover todas as tags HTML
      mainContent = mainContent.replace(/<[^>]*>/g, ' ');
      
      // Limpar entidades HTML
      mainContent = mainContent
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#\d+;/g, ' ');
      
      // Limpar espaços extras e quebras de linha
      mainContent = mainContent
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
      
      // Construir conteúdo final
      let finalContent = '';
      
      if (title && title !== 'Untitled') {
        finalContent += `# ${title}\n\n`;
      }
      
      if (description) {
        finalContent += `${description}\n\n`;
      }
      
      // Pegar os primeiros parágrafos (aproximadamente 800 palavras)
      const words = mainContent.split(' ').filter(word => word.length > 0);
      const excerpt = words.slice(0, 800).join(' ');
      
      if (excerpt.length < 100) {
        return `Título: ${title || 'Sem título'}\n\nConteúdo não disponível para preview.\n\nEste artigo pode ter restrições de acesso ou usar tecnologias que impedem a extração do conteúdo.\n\nClique em "Ver Original" para acessar o artigo completo no site.`;
      }
      
      finalContent += excerpt;
      
      if (words.length > 800) {
        finalContent += '...\n\n[Conteúdo truncado - clique em "Ver Original" para ler o artigo completo]';
      }
      
      return finalContent;
      
    } catch (error) {
      console.error('Erro ao processar HTML:', error);
      return 'Erro ao processar o conteúdo da página. Clique em "Ver Original" para acessar o artigo.';
    }
  }

  // Gerar resumo simples
  generateSimpleSummary(query, results) {
    const sources = [...new Set(results.map(r => r.source_name))];
    const totalResults = results.length;
    
    return `Encontrei ${totalResults} resultados sobre "${query}" em ${sources.length} fontes diferentes:

${sources.map(source => `• ${source}`).join('\n')}

Os resultados incluem discussões, artigos e projetos relacionados ao tema. As fontes mais relevantes destacam ${results.slice(0, 3).map(r => r.title).join(', ')}.

Esta busca agregou informações de plataformas como Hacker News, Dev.to, GitHub e outras fontes técnicas especializadas.`;
  }

  // Endpoint de estatísticas
  handleStats(res) {
    const stats = riventaServer.getStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
  }

  // Endpoint de health check
  handleHealth(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Riventa backend funcionando!'
    }));
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 Servidor HTTP parado');
    }
  }
}

// Iniciar servidor
const httpServer = new HTTPServer(8787);
httpServer.start().catch(error => {
  console.error('💥 Falha ao iniciar servidor HTTP:', error);
});

export { HTTPServer };
// Sistema de logs para monitoramento
export class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  // Log de informação
  info(message, data = {}) {
    this.addLog('INFO', message, data);
    console.log(`[INFO] ${message}`, data);
  }

  // Log de erro
  error(message, error = {}) {
    this.addLog('ERROR', message, { 
      error: error.message || error,
      stack: error.stack 
    });
    console.error(`[ERROR] ${message}`, error);
  }

  // Log de aviso
  warn(message, data = {}) {
    this.addLog('WARN', message, data);
    console.warn(`[WARN] ${message}`, data);
  }

  // Log de busca (para analytics)
  search(query, results, fromCache = false) {
    this.addLog('SEARCH', 'Busca realizada', {
      query: query,
      resultCount: results.length,
      fromCache: fromCache,
      timestamp: new Date().toISOString()
    });
  }

  // Adicionar log interno
  addLog(level, message, data) {
    // Remove logs antigos se necessário
    if (this.logs.length >= this.maxLogs) {
      this.logs.shift();
    }

    this.logs.push({
      level: level,
      message: message,
      data: data,
      timestamp: new Date().toISOString()
    });
  }

  // Obter estatísticas
  getStats() {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 3600000);
    
    const recentLogs = this.logs.filter(log => 
      new Date(log.timestamp) > lastHour
    );

    const searches = recentLogs.filter(log => log.level === 'SEARCH');
    const errors = recentLogs.filter(log => log.level === 'ERROR');

    return {
      totalSearches: searches.length,
      totalErrors: errors.length,
      cacheHitRate: this.calculateCacheHitRate(searches),
      mostSearchedTerms: this.getMostSearchedTerms(searches)
    };
  }

  // Calcular taxa de cache hit
  calculateCacheHitRate(searches) {
    if (searches.length === 0) return 0;
    
    const cacheHits = searches.filter(s => s.data.fromCache).length;
    return Math.round((cacheHits / searches.length) * 100);
  }

  // Obter termos mais buscados
  getMostSearchedTerms(searches) {
    const terms = {};
    
    searches.forEach(search => {
      const query = search.data.query;
      terms[query] = (terms[query] || 0) + 1;
    });

    return Object.entries(terms)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([term, count]) => ({ term, count }));
  }

  // Salvar logs em arquivo (simulado)
  async saveLogs() {
    const logsToSave = {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      recentLogs: this.logs.slice(-50)
    };

    console.log('Logs salvos:', logsToSave);
    return logsToSave;
  }
}

export const logger = new Logger();
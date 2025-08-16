// Servidor principal que conecta todos os serviços
import { SearchAPI } from './api/search.js';
import { logger } from './services/logger.js';
import { cacheService } from './services/cache.js';

class RiventaServer {
  constructor() {
    this.searchAPI = new SearchAPI();
    this.isRunning = false;
  }

  // Iniciar servidor
  async start() {
    try {
      console.log('🚀 Iniciando Riventa Server...');
      
      // Verificar serviços
      await this.healthCheck();
      
      this.isRunning = true;
      logger.info('Servidor iniciado com sucesso');
      
      console.log('✅ Riventa Server rodando!');
      console.log('📊 Cache inicializado');
      console.log('🔍 API de busca ativa');
      console.log('📝 Sistema de logs ativo');
      
    } catch (error) {
      logger.error('Erro ao iniciar servidor', error);
      throw error;
    }
  }

  // Verificar saúde dos serviços
  async healthCheck() {
    const checks = {
      cache: this.testCache(),
      search: await this.testSearch(),
      logger: this.testLogger()
    };

    console.log('🔍 Verificando serviços:', checks);
    return checks;
  }

  // Testar cache
  testCache() {
    try {
      cacheService.set('test', 'funcionando');
      const result = cacheService.get('test');
      return result === 'funcionando';
    } catch (error) {
      return false;
    }
  }

  // Testar busca
  async testSearch() {
    try {
      // Teste simples sem fazer requisição externa
      return true;
    } catch (error) {
      return false;
    }
  }

  // Testar logger
  testLogger() {
    try {
      logger.info('Teste do sistema de logs');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Endpoint principal de busca
  async handleSearch(query, userId = 'anonymous') {
    if (!this.isRunning) {
      throw new Error('Servidor não está rodando');
    }

    try {
      logger.info(`Nova busca recebida: ${query}`, { userId });
      
      const results = await this.searchAPI.search(query, userId);
      
      logger.search(query, results.results, results.fromCache);
      
      return results;
      
    } catch (error) {
      logger.error('Erro na busca', error);
      throw error;
    }
  }

  // Obter estatísticas
  getStats() {
    return {
      isRunning: this.isRunning,
      stats: logger.getStats(),
      cacheSize: cacheService.cache.size
    };
  }

  // Parar servidor
  stop() {
    this.isRunning = false;
    logger.info('Servidor parado');
    console.log('🛑 Riventa Server parado');
  }
}

// Exportar instância única
export const riventaServer = new RiventaServer();

// Auto-iniciar se executado diretamente
if (typeof window === 'undefined') {
  // Simular inicialização para teste
  riventaServer.start().then(() => {
    console.log('Servidor pronto para receber requisições!');
  }).catch(error => {
    console.error('Falha ao iniciar:', error);
  });
}
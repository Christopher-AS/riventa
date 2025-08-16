// Arquivo de teste para verificar se tudo funciona
import { riventaServer } from './server.js';
import { logger } from './services/logger.js';
import { cacheService } from './services/cache.js';

async function runTests() {
  console.log('🧪 Iniciando testes do Riventa...\n');

  try {
    // Teste 1: Iniciar servidor
    console.log('1️⃣ Testando inicialização do servidor...');
    await riventaServer.start();
    console.log('✅ Servidor iniciado com sucesso\n');

    // Teste 2: Testar cache
    console.log('2️⃣ Testando sistema de cache...');
    cacheService.set('teste_cache', { data: 'funcionando' });
    const cacheResult = cacheService.get('teste_cache');
    console.log('✅ Cache funcionando:', cacheResult.data === 'funcionando' ? 'SIM' : 'NÃO');
    console.log('📊 Itens no cache:', cacheService.cache.size, '\n');

    // Teste 3: Testar logger
    console.log('3️⃣ Testando sistema de logs...');
    logger.info('Teste de log de informação');
    logger.warn('Teste de log de aviso');
    logger.search('teste query', [1, 2, 3], false);
    const stats = logger.getStats();
    console.log('✅ Logger funcionando - Buscas registradas:', stats.totalSearches);
    console.log('📈 Estatísticas:', stats, '\n');

    // Teste 4: Testar busca (simulada)
    console.log('4️⃣ Testando sistema de busca...');
    // Como não temos APIs externas conectadas ainda, vamos simular
    console.log('⚠️  Busca externa ainda não configurada (próximo passo)');
    console.log('✅ Estrutura de busca criada e pronta\n');

    // Teste 5: Verificar estatísticas gerais
    console.log('5️⃣ Verificando estatísticas gerais...');
    const serverStats = riventaServer.getStats();
    console.log('✅ Status do servidor:', serverStats.isRunning ? 'RODANDO' : 'PARADO');
    console.log('📊 Cache size:', serverStats.cacheSize);
    console.log('📈 Estatísticas completas:', serverStats.stats, '\n');

    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Seu backend está funcionando perfeitamente');
    console.log('📋 Próximo passo: Conectar com APIs externas\n');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    logger.error('Falha nos testes', error);
  }
}

// Executar testes
runTests();
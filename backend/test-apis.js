// Teste específico das APIs externas
import { SourceManager } from './services/sources.js';
import { logger } from './services/logger.js';

async function testExternalAPIs() {
  console.log('🌐 Testando APIs externas do Riventa...\n');

  const sourceManager = new SourceManager();
  
  console.log(`📊 Fontes habilitadas: ${sourceManager.enabledSources.length}`);
  sourceManager.enabledSources.forEach(source => {
    console.log(`  - ${source.name} (peso: ${source.weight})`);
  });
  console.log('');

  // Lista de termos para testar
  const testQueries = [
    'inteligência artificial',
    'startups brasil',
    'tecnologia'
  ];

  for (const query of testQueries) {
    console.log(`🔍 Testando busca: "${query}"`);
    console.log('─'.repeat(50));
    
    try {
      const startTime = Date.now();
      const results = await sourceManager.searchAll(query);
      const endTime = Date.now();
      
      console.log(`⏱️  Tempo de resposta: ${endTime - startTime}ms`);
      console.log(`📊 Resultados encontrados: ${results.length}`);
      
      if (results.length > 0) {
        console.log('📋 Primeiros resultados:');
        results.slice(0, 3).forEach((result, index) => {
          console.log(`  ${index + 1}. [${result.source_name}] ${result.title}`);
          console.log(`     ${result.snippet.substring(0, 100)}...`);
          console.log(`     URL: ${result.url}`);
          console.log('');
        });
      } else {
        console.log('❌ Nenhum resultado encontrado');
      }
      
      // Log da busca
      logger.search(query, results, false);
      
    } catch (error) {
      console.error(`❌ Erro na busca "${query}":`, error.message);
      logger.error(`Erro na busca: ${query}`, error);
    }
    
    console.log('═'.repeat(50));
    console.log('');
  }

  // Mostrar estatísticas finais
  console.log('📈 ESTATÍSTICAS FINAIS:');
  const stats = logger.getStats();
  console.log(`  - Total de buscas: ${stats.totalSearches}`);
  console.log(`  - Erros: ${stats.totalErrors}`);
  console.log(`  - Taxa de sucesso: ${stats.totalSearches > 0 ? Math.round(((stats.totalSearches - stats.totalErrors) / stats.totalSearches) * 100) : 0}%`);
  
  if (stats.mostSearchedTerms.length > 0) {
    console.log('  - Termos mais buscados:');
    stats.mostSearchedTerms.forEach(term => {
      console.log(`    * "${term.term}": ${term.count} vezes`);
    });
  }
  
  console.log('\n🎉 Teste das APIs concluído!');
}

// Executar teste
testExternalAPIs().catch(error => {
  console.error('💥 Falha no teste:', error);
});
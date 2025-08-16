// Configurações do banco de dados e cache
export const dbConfig = {
  // Cache em memória para respostas rápidas
  cache: {
    maxSize: 1000,
    ttl: 300000 // 5 minutos
  },
  
  // Configurações de fontes de dados
  sources: {
    maxResults: 10,
    timeout: 5000,
    retries: 3
  },
  
  // Rate limiting
  rateLimit: {
    maxRequests: 100,
    windowMs: 3600000 // 1 hora
  }
};
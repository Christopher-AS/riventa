// Configuração das APIs externas - VERSÃO ROBUSTA
export const apiConfig = {
  // APIs gratuitas e confiáveis
  free: {
    hackernews: {
      name: 'Hacker News',
      baseUrl: 'https://hn.algolia.com/api/v1/search',
      enabled: true,
      weight: 0.8
    },
    devto: {
      name: 'Dev.to',
      baseUrl: 'https://dev.to/api/articles',
      enabled: true,
      weight: 0.7
    },
    github: {
      name: 'GitHub',
      baseUrl: 'https://api.github.com/search/repositories',
      enabled: true,
      weight: 0.6
    },
    jsonplaceholder: {
      name: 'Tech News Demo',
      baseUrl: 'https://jsonplaceholder.typicode.com/posts',
      enabled: true,
      weight: 0.5
    },
    openweather: {
      name: 'Contextual Info',
      baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
      enabled: false, // Precisa de key
      weight: 0.3
    }
  },

  // APIs premium/com chave
  premium: {
    newsapi: {
      name: 'News API',
      baseUrl: 'https://newsapi.org/v2/everything',
      enabled: false,
      key: '', // Você pode conseguir grátis em newsapi.org
      weight: 0.9
    },
    serpapi: {
      name: 'Google Search',
      baseUrl: 'https://serpapi.com/search',
      enabled: false,
      key: '', // Alternativa ao Google direto
      weight: 1.0
    }
  },

  // Configurações
  settings: {
    timeout: 5000,
    maxRetries: 3,
    maxResults: 15,
    userAgent: 'Riventa/1.0 (Research Tool)'
  }
};
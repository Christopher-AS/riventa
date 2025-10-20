import { Source } from './types';

const brazilianSources: Source[] = [
  {
    id: 'infomoney',
    name: 'InfoMoney',
    url: 'https://infomoney.com.br',
    baseUrl: 'https://infomoney.com.br',
    enabled: true,
    priority: 10,
    selectors: {
      title: 'h1.article-title',
      content: 'div.article-content',
      date: 'time.published',
      author: 'span.author-name'
    },
    crawlFrequency: '30min',
    category: 'financas'
  },
  {
    id: 'brazil-journal',
    name: 'Brazil Journal',
    url: 'https://braziljournal.com',
    baseUrl: 'https://braziljournal.com',
    enabled: true,
    priority: 10,
    selectors: {
      title: 'h1.entry-title',
      content: 'div.entry-content',
      date: 'time.published-date',
      author: 'span.author'
    },
    crawlFrequency: '30min',
    category: 'negocios'
  },
  {
    id: 'revista-oeste',
    name: 'Revista Oeste',
    url: 'https://revistaoeste.com',
    baseUrl: 'https://revistaoeste.com',
    enabled: true,
    priority: 9,
    selectors: {
      title: 'h1.entry-title',
      content: 'div.entry-content',
      date: 'time',
      author: 'span.author-name'
    },
    crawlFrequency: '30min',
    category: 'geral'
  },
  {
    id: 'terra',
    name: 'Terra',
    url: 'https://terra.com.br',
    baseUrl: 'https://terra.com.br',
    enabled: true,
    priority: 9,
    selectors: {
      title: 'h1.article-title',
      content: 'div.article-body',
      date: 'time',
      author: 'span.author'
    },
    crawlFrequency: '30min',
    category: 'geral'
  },
  {
    id: 'times-brasil',
    name: 'Times Brasil',
    url: 'https://timesbrasil.com.br',
    baseUrl: 'https://timesbrasil.com.br',
    enabled: true,
    priority: 9,
    selectors: {
      title: 'h1.entry-title',
      content: 'div.entry-content',
      date: 'time',
      author: 'span.author'
    },
    crawlFrequency: '30min',
    category: 'geral'
  },
  {
    id: 'r7',
    name: 'R7',
    url: 'https://r7.com',
    baseUrl: 'https://r7.com',
    enabled: true,
    priority: 8,
    selectors: {
      title: 'h1.title',
      content: 'div.article-content',
      date: 'time',
      author: 'span.author-name'
    },
    crawlFrequency: '1h',
    category: 'geral'
  },
  {
    id: 'uol',
    name: 'UOL',
    url: 'https://uol.com.br',
    baseUrl: 'https://uol.com.br',
    enabled: true,
    priority: 9,
    selectors: {
      title: 'h1.p-title',
      content: 'div.text',
      date: 'time',
      author: 'p.author'
    },
    crawlFrequency: '30min',
    category: 'geral'
  },
  {
    id: 'metropoles',
    name: 'Metrópoles',
    url: 'https://metropoles.com',
    baseUrl: 'https://metropoles.com',
    enabled: true,
    priority: 8,
    selectors: {
      title: 'h1.Article_title',
      content: 'div.Article_body',
      date: 'time',
      author: 'span.Article_author'
    },
    crawlFrequency: '1h',
    category: 'geral'
  },
  {
    id: 'poder360',
    name: 'Poder360',
    url: 'https://poder360.com.br',
    baseUrl: 'https://poder360.com.br',
    enabled: true,
    priority: 8,
    selectors: {
      title: 'h1.entry-title',
      content: 'div.entry-content',
      date: 'time.published',
      author: 'span.author'
    },
    crawlFrequency: '1h',
    category: 'politica'
  },
  {
    id: 'exame',
    name: 'Exame',
    url: 'https://exame.com',
    baseUrl: 'https://exame.com',
    enabled: true,
    priority: 8,
    selectors: {
      title: 'h1.entry-title',
      content: 'div.entry-content',
      date: 'time',
      author: 'span.author-name'
    },
    crawlFrequency: '1h',
    category: 'negocios'
  },
  {
    id: 'tecnoblog',
    name: 'Tecnoblog',
    url: 'https://tecnoblog.net',
    baseUrl: 'https://tecnoblog.net',
    enabled: true,
    priority: 8,
    selectors: {
      title: 'h1.entry-title',
      content: 'div.entry-content',
      date: 'time',
      author: 'span.author-name'
    },
    crawlFrequency: '1h',
    category: 'tech'
  },
  {
    id: 'olhar-digital',
    name: 'Olhar Digital',
    url: 'https://olhardigital.com.br',
    baseUrl: 'https://olhardigital.com.br',
    enabled: true,
    priority: 8,
    selectors: {
      title: 'h1.mat-title',
      content: 'div.mat-text',
      date: 'time',
      author: 'span.author'
    },
    crawlFrequency: '1h',
    category: 'tech'
  },
  {
    id: 'startups',
    name: 'Startups',
    url: 'https://startups.com.br',
    baseUrl: 'https://startups.com.br',
    enabled: true,
    priority: 8,
    selectors: {
      title: 'h1.title',
      content: 'div.content',
      date: 'time',
      author: 'span.author'
    },
    crawlFrequency: '1h',
    category: 'startups'
  },
  {
    id: 'money-times',
    name: 'Money Times',
    url: 'https://moneytimes.com.br',
    baseUrl: 'https://moneytimes.com.br',
    enabled: true,
    priority: 9,
    selectors: {
      title: 'h1.entry-title',
      content: 'div.entry-content',
      date: 'time',
      author: 'span.author'
    },
    crawlFrequency: '30min',
    category: 'financas'
  },
  {
    id: 'gazeta-povo',
    name: 'Gazeta do Povo',
    url: 'https://gazetadopovo.com.br',
    baseUrl: 'https://gazetadopovo.com.br',
    enabled: true,
    priority: 8,
    selectors: {
      title: 'h1.article-title',
      content: 'div.article-content',
      date: 'time',
      author: 'span.author-name'
    },
    crawlFrequency: '1h',
    category: 'geral'
  }
];

export default brazilianSources;

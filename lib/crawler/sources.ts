/**
 * List of Brazilian news sources for ethical crawling
 */

import { CrawlSource } from './types';

export const BRAZILIAN_NEWS_SOURCES: CrawlSource[] = [
  {
    id: 'g1',
    name: 'G1',
    baseUrl: 'https://g1.globo.com',
    rssUrl: 'https://g1.globo.com/rss/g1/',
    category: 'general',
    language: 'pt',
    country: 'br',
  },
  {
    id: 'folha',
    name: 'Folha de S.Paulo',
    baseUrl: 'https://www.folha.uol.com.br',
    rssUrl: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml',
    category: 'general',
    language: 'pt',
    country: 'br',
  },
  {
    id: 'estadao',
    name: 'Estadão',
    baseUrl: 'https://www.estadao.com.br',
    rssUrl: 'https://www.estadao.com.br/rss/',
    category: 'general',
    language: 'pt',
    country: 'br',
  },
  {
    id: 'uol',
    name: 'UOL Notícias',
    baseUrl: 'https://noticias.uol.com.br',
    rssUrl: 'https://rss.uol.com.br/feed/noticias.xml',
    category: 'general',
    language: 'pt',
    country: 'br',
  },
  {
    id: 'cnn-brasil',
    name: 'CNN Brasil',
    baseUrl: 'https://www.cnnbrasil.com.br',
    category: 'general',
    language: 'pt',
    country: 'br',
  },
  {
    id: 'band',
    name: 'Band',
    baseUrl: 'https://www.band.uol.com.br',
    category: 'general',
    language: 'pt',
    country: 'br',
  },
  {
    id: 'r7',
    name: 'R7',
    baseUrl: 'https://www.r7.com',
    rssUrl: 'https://www.r7.com/rss',
    category: 'general',
    language: 'pt',
    country: 'br',
  },
  {
    id: 'valor',
    name: 'Valor Econômico',
    baseUrl: 'https://valor.globo.com',
    category: 'business',
    language: 'pt',
    country: 'br',
  },
  {
    id: 'exame',
    name: 'Exame',
    baseUrl: 'https://exame.com',
    category: 'business',
    language: 'pt',
    country: 'br',
  },
  {
    id: 'infomoney',
    name: 'InfoMoney',
    baseUrl: 'https://www.infomoney.com.br',
    category: 'business',
    language: 'pt',
    country: 'br',
  },
];

export function getSourceById(id: string): CrawlSource | undefined {
  return BRAZILIAN_NEWS_SOURCES.find(source => source.id === id);
}

export function getSourcesByCategory(category: string): CrawlSource[] {
  return BRAZILIAN_NEWS_SOURCES.filter(source => source.category === category);
}

export function getAllSources(): CrawlSource[] {
  return [...BRAZILIAN_NEWS_SOURCES];
}

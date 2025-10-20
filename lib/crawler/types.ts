/**
 * Core types for the ethical web crawler
 */

export interface Source {
  id: string;
  name: string;
  url: string;
  baseUrl: string;
  enabled: boolean;
  priority: number;
  selectors: {
    article?: string;
    title: string;
    content: string;
    date: string;
    author: string;
    image?: string;
    category?: string;
  };
  crawlFrequency: number;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  url: string;
  source: string;
  publishedAt: Date;
  author?: string;
  images: string[];
  category?: string;
}

export interface CrawlerConfig {
  requestsPerSecond: number;
  respectRobotsTxt: boolean;
  userAgent: string;
  timeout: number;
  retries: number;
  maxConcurrent: number;
}

export interface CrawlResult {
  success: boolean;
  article?: Article;
  error?: string;
  source: string;
  timestamp: Date;
  responseTime: number;
}

export interface RateLimiterConfig {
  requestsPerSecond: number;
  tokensPerInterval: number;
}

export interface RobotsConfig {
  userAgent: string;
  canCrawl: boolean;
  crawlDelay: number;
}

export interface CrawlSource {
  id: string;
  name: string;
  baseUrl: string;
  rssUrl?: string;
  selectors?: {
    article?: string;
    title?: string;
    content?: string;
    author?: string;
    publishDate?: string;
  };
  category?: string;
  language?: string;
  country?: string;
}

export interface RobotsRules {
  userAgent: string;
  allowed: string[];
  disallowed: string[];
  crawlDelay?: number;
  sitemaps: string[];
}

export interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  respectCrawlDelay: boolean;
  minDelayMs: number;
  maxDelayMs: number;
}

export interface CrawlJob {
  id: string;
  sourceId: string;
  url: string;
  priority: number;
  attempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

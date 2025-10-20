/**
 * Core types for the ethical web crawler
 */

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

export interface CrawlResult {
  url: string;
  title: string;
  content: string;
  author?: string;
  publishedAt?: Date;
  source: string;
  category?: string;
  imageUrl?: string;
  success: boolean;
  error?: string;
  crawledAt: Date;
}

export interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  respectCrawlDelay: boolean;
  minDelayMs: number;
  maxDelayMs: number;
}

export interface CrawlerConfig {
  userAgent: string;
  timeout: number;
  maxRetries: number;
  rateLimits: RateLimitConfig;
  respectRobotsTxt: boolean;
  maxConcurrent: number;
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

/**
 * Main crawler orchestrator
 * Coordinates ethical web crawling with rate limiting and robots.txt compliance
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { RobotsParser } from './robots-parser';
import { RateLimiter } from './rate-limiter';
import { CrawlerConfig, CrawlSource, CrawlResult, CrawlJob, Article, Source } from './types';
import brazilianSources from './sources';

export class EthicalCrawler {
  private config: CrawlerConfig;
  private robotsParser: RobotsParser;
  private rateLimiter: RateLimiter;
  private activeJobs: Map<string, CrawlJob>;
  private jobQueue: CrawlJob[];
  private stats: CrawlerStats;

  constructor(config?: Partial<CrawlerConfig>) {
    this.config = this.getDefaultConfig(config);
    this.robotsParser = new RobotsParser();
    this.rateLimiter = new RateLimiter({
      requestsPerSecond: 2,
      tokensPerInterval: 2,
    });
    this.activeJobs = new Map();
    this.jobQueue = [];
    this.stats = {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      activeJobs: 0,
      queuedJobs: 0,
      successRate: 0,
      averageResponseTime: 0,
      totalBytesCrawled: 0,
    };
  }

  /**
   * Crawl a single source and return articles
   */
  async crawlSource(source: Source): Promise<Article[]> {
    const articles: Article[] = [];

    try {
      console.log(`[Crawler] Starting crawl for ${source.name} (${source.url})`);

      // Check robots.txt first
      if (this.config.respectRobotsTxt) {
        const canCrawl = await this.robotsParser.canCrawl(
          source.url,
          this.config.userAgent
        );

        if (!canCrawl) {
          console.warn(`[Crawler] Robots.txt disallows crawling ${source.url}`);
          return articles;
        }

        // Check for crawl delay
        const baseUrl = new URL(source.url).origin;
        const crawlDelay = await this.robotsParser.getCrawlDelay(
          baseUrl,
          this.config.userAgent
        );

        if (crawlDelay) {
          console.log(`[Crawler] Respecting crawl delay of ${crawlDelay}s for ${source.name}`);
          await this.sleep(crawlDelay * 1000);
        }
      }

      // Apply rate limiting
      await this.rateLimiter.acquire();

      const startTime = Date.now();

      // Fetch HTML
      const response = await axios.get(source.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'RiventaBot/1.0 (Ethical News Aggregator; +https://riventa.com/bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
        maxRedirects: 5,
      });

      const responseTime = Date.now() - startTime;
      this.stats.totalBytesCrawled += response.data.length;

      console.log(`[Crawler] Fetched ${source.name} in ${responseTime}ms (${response.data.length} bytes)`);

      // Parse HTML with cheerio
      const $ = cheerio.load(response.data);

      // Extract articles using selectors
      const articleElements = $(source.selectors.article || 'article');

      console.log(`[Crawler] Found ${articleElements.length} article elements in ${source.name}`);

      articleElements.each((index, element) => {
        try {
          const article = this.extractArticle($, element, source, source.url);
          if (article) {
            articles.push(article);
          }
        } catch (error) {
          console.error(`[Crawler] Error extracting article ${index} from ${source.name}:`, error);
        }
      });

      console.log(`[Crawler] Successfully extracted ${articles.length} articles from ${source.name}`);
      this.stats.completedJobs++;

    } catch (error) {
      console.error(`[Crawler] Error crawling ${source.name}:`, error);
      this.stats.failedJobs++;
    }

    return articles;
  }

  /**
   * Extract article data from HTML element
   */
  private extractArticle(
    $: cheerio.CheerioAPI,
    element: cheerio.AnyNode,
    source: Source,
    pageUrl: string
  ): Article | null {
    try {
      const $element = $(element);

      // Extract title
      const titleElement = source.selectors.title
        ? $element.find(source.selectors.title)
        : $element.find('h1, h2, h3').first();
      const title = titleElement.text().trim();

      if (!title) {
        return null;
      }

      // Extract content
      const contentElement = source.selectors.content
        ? $element.find(source.selectors.content)
        : $element.find('p').first();
      const content = contentElement.text().trim();

      // Extract URL
      let articleUrl = pageUrl;
      const linkElement = $element.find('a[href]').first();
      if (linkElement.length) {
        const href = linkElement.attr('href');
        if (href) {
          articleUrl = this.resolveUrl(href, source.baseUrl);
        }
      }

      // Extract author
      let author: string | undefined;
      if (source.selectors.author) {
        const authorElement = $element.find(source.selectors.author);
        author = authorElement.text().trim() || undefined;
      }

      // Extract images
      const images: string[] = [];
      const imageSelector = source.selectors.image || 'img';
      $element.find(imageSelector).each((_, img) => {
        const src = $(img).attr('src') || $(img).attr('data-src');
        if (src) {
          const imageUrl = this.resolveUrl(src, source.baseUrl);
          images.push(imageUrl);
        }
      });

      // Extract published date
      let publishedAt = new Date();
      if (source.selectors.date) {
        const dateElement = $element.find(source.selectors.date);
        const dateText = dateElement.attr('datetime') || dateElement.text().trim();
        if (dateText) {
          const parsedDate = new Date(dateText);
          if (!isNaN(parsedDate.getTime())) {
            publishedAt = parsedDate;
          }
        }
      }

      // Extract category
      let category: string | undefined;
      if (source.selectors.category) {
        const categoryElement = $element.find(source.selectors.category);
        category = categoryElement.text().trim() || undefined;
      }

      // Generate article ID
      const id = this.generateArticleId(articleUrl, title);

      const article: Article = {
        id,
        title,
        content: content || title,
        url: articleUrl,
        source: source.name,
        publishedAt,
        author,
        images,
        category,
      };

      return article;
    } catch (error) {
      console.error('[Crawler] Error extracting article:', error);
      return null;
    }
  }

  /**
   * Crawl all enabled sources
   */
  async crawlAll(): Promise<Article[]> {
    const allArticles: Article[] = [];

    console.log(`[Crawler] Starting crawl of all enabled sources (${brazilianSources.length} sources)`);

    for (const source of brazilianSources) {
      if (!source.enabled) {
        console.log(`[Crawler] Skipping disabled source: ${source.name}`);
        continue;
      }

      try {
        const articles = await this.crawlSource(source);
        allArticles.push(...articles);

        // Add delay between sources to be respectful
        await this.sleep(2000);
      } catch (error) {
        console.error(`[Crawler] Error crawling source ${source.name}:`, error);
      }
    }

    console.log(`[Crawler] Completed crawl of all sources. Total articles: ${allArticles.length}`);

    return allArticles;
  }

  /**
   * Crawl a single URL
   */
  async crawlUrl(url: string, source: CrawlSource): Promise<CrawlResult> {
    const startTime = Date.now();

    try {
      // Check robots.txt
      if (this.config.respectRobotsTxt) {
        const canCrawl = await this.robotsParser.canCrawl(url, this.config.userAgent);
        if (!canCrawl) {
          return {
            success: false,
            error: 'Disallowed by robots.txt',
            source: source.name,
            timestamp: new Date(),
            responseTime: Date.now() - startTime,
          };
        }
      }

      // Apply rate limiting
      await this.rateLimiter.acquire();

      // Fetch the page
      const response = await axios.get(url, {
        timeout: this.config.timeout,
        headers: {
          'User-Agent': this.config.userAgent,
        },
      });

      const $ = cheerio.load(response.data);

      // Extract article (simplified for single URL)
      const title = $('h1').first().text().trim() || $('title').text().trim();
      const content = $('article p, .content p, .article-body p')
        .map((_, el) => $(el).text().trim())
        .get()
        .join('\n\n');

      const images: string[] = [];
      $('article img, .content img').each((_, img) => {
        const src = $(img).attr('src');
        if (src) {
          images.push(this.resolveUrl(src, source.baseUrl));
        }
      });

      const article: Article = {
        id: this.generateArticleId(url, title),
        title,
        content: content || title,
        url,
        source: source.name,
        publishedAt: new Date(),
        images,
      };

      return {
        success: true,
        article,
        source: source.name,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: source.name,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Add a crawl job to the queue
   */
  addJob(url: string, sourceId: string, priority: number = 0): string {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job: CrawlJob = {
      id: jobId,
      sourceId,
      url,
      priority,
      attempts: 0,
      status: 'pending',
      createdAt: new Date(),
    };

    this.jobQueue.push(job);
    this.jobQueue.sort((a, b) => b.priority - a.priority);

    this.stats.queuedJobs++;
    this.stats.totalJobs++;

    console.log(`[Crawler] Added job ${jobId} to queue (priority: ${priority})`);

    return jobId;
  }

  /**
   * Process the job queue
   */
  async processQueue(): Promise<void> {
    console.log(`[Crawler] Processing queue with ${this.jobQueue.length} jobs`);

    while (this.jobQueue.length > 0) {
      const job = this.jobQueue.shift();
      if (!job) continue;

      this.stats.queuedJobs--;
      this.stats.activeJobs++;

      job.status = 'processing';
      job.startedAt = new Date();
      this.activeJobs.set(job.id, job);

      try {
        // Find the source
        const source = brazilianSources.find(s => s.id === job.sourceId);
        if (!source) {
          throw new Error(`Source ${job.sourceId} not found`);
        }

        // Crawl the URL
        const result = await this.crawlUrl(job.url, source);

        if (result.success) {
          job.status = 'completed';
          this.stats.completedJobs++;
        } else {
          job.status = 'failed';
          this.stats.failedJobs++;
        }
      } catch (error) {
        console.error(`[Crawler] Error processing job ${job.id}:`, error);
        job.status = 'failed';
        this.stats.failedJobs++;
      } finally {
        job.completedAt = new Date();
        this.activeJobs.delete(job.id);
        this.stats.activeJobs--;
      }
    }

    console.log('[Crawler] Queue processing completed');
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): CrawlJob | undefined {
    return this.activeJobs.get(jobId);
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const jobIndex = this.jobQueue.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      this.jobQueue.splice(jobIndex, 1);
      this.stats.queuedJobs--;
      console.log(`[Crawler] Cancelled job ${jobId}`);
      return true;
    }
    return false;
  }

  /**
   * Get crawler statistics
   */
  getStats(): CrawlerStats {
    const totalCompleted = this.stats.completedJobs + this.stats.failedJobs;
    this.stats.successRate = totalCompleted > 0
      ? (this.stats.completedJobs / totalCompleted) * 100
      : 0;

    return { ...this.stats };
  }

  /**
   * Shutdown the crawler gracefully
   */
  async shutdown(): Promise<void> {
    console.log('[Crawler] Shutting down gracefully...');

    // Clear the queue
    this.jobQueue = [];
    this.stats.queuedJobs = 0;

    // Wait for active jobs to complete (with timeout)
    const timeout = 30000; // 30 seconds
    const startTime = Date.now();

    while (this.activeJobs.size > 0 && Date.now() - startTime < timeout) {
      await this.sleep(1000);
    }

    if (this.activeJobs.size > 0) {
      console.warn(`[Crawler] Shutdown timeout: ${this.activeJobs.size} jobs still active`);
    }

    console.log('[Crawler] Shutdown complete');
  }

  /**
   * Resolve relative URLs to absolute
   */
  private resolveUrl(url: string, baseUrl: string): string {
    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      if (url.startsWith('//')) {
        return 'https:' + url;
      }
      const base = new URL(baseUrl);
      if (url.startsWith('/')) {
        return `${base.protocol}//${base.host}${url}`;
      }
      return new URL(url, baseUrl).href;
    } catch (error) {
      console.error('[Crawler] Error resolving URL:', url, error);
      return url;
    }
  }

  /**
   * Generate a unique article ID
   */
  private generateArticleId(url: string, title: string): string {
    const hash = this.simpleHash(url + title);
    return `article-${hash}`;
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(overrides?: Partial<CrawlerConfig>): CrawlerConfig {
    return {
      userAgent: 'RiventaBot/1.0 (Ethical News Aggregator; +https://riventa.com/bot)',
      timeout: 30000,
      maxRetries: 3,
      respectRobotsTxt: true,
      maxConcurrent: 5,
      rateLimits: {
        requestsPerSecond: 2,
        requestsPerMinute: 10,
        requestsPerHour: 100,
        respectCrawlDelay: true,
        minDelayMs: 1000,
        maxDelayMs: 5000,
      },
      ...overrides,
    };
  }
}

interface CrawlerStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  activeJobs: number;
  queuedJobs: number;
  successRate: number;
  averageResponseTime: number;
  totalBytesCrawled: number;
}

// Export all types and classes
export * from './types';
export * from './sources';
export { RobotsParser } from './robots-parser';
export { RateLimiter } from './rate-limiter';

// Export a default instance
export const crawler = new EthicalCrawler();

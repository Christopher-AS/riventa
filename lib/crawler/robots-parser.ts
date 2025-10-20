/**
 * Robots.txt parser and validator
 * Ensures ethical crawling by respecting robots.txt rules
 */

import { RobotsRules, RobotsConfig } from './types';

export class RobotsParser {
  private cache: Map<string, RobotsRules>;
  private cacheExpiry: Map<string, number>;
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
  }

  /**
   * Fetch and parse robots.txt for a given domain
   */
  async fetchRobotsTxt(baseUrl: string): Promise<RobotsRules> {
    // Check cache first
    if (!this.isCacheExpired(baseUrl)) {
      const cached = this.cache.get(baseUrl);
      if (cached) {
        return cached;
      }
    }

    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).toString();
      const response = await fetch(robotsUrl, {
        headers: {
          'User-Agent': 'RiventaBot/1.0 (Ethical News Aggregator; +https://riventa.com/bot)',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        // If robots.txt doesn't exist, allow all crawling
        return this.createDefaultRules(baseUrl);
      }

      const content = await response.text();
      const rules = this.parseRobotsTxt(content, baseUrl);

      // Cache the results
      this.cache.set(baseUrl, rules);
      this.cacheExpiry.set(baseUrl, Date.now() + this.CACHE_TTL_MS);

      return rules;
    } catch (error) {
      console.warn(`Failed to fetch robots.txt for ${baseUrl}:`, error);
      // On error, allow crawling by default
      return this.createDefaultRules(baseUrl);
    }
  }

  /**
   * Parse robots.txt content
   */
  private parseRobotsTxt(content: string, baseUrl: string): RobotsRules {
    const lines = content.split('\n').map(line => line.trim());
    const rules: RobotsRules = {
      userAgent: '*',
      allowed: [],
      disallowed: [],
      crawlDelay: undefined,
      sitemaps: [],
    };

    let currentUserAgent: string | null = null;
    const userAgentRules: Map<string, { allowed: string[]; disallowed: string[]; crawlDelay?: number }> = new Map();

    for (const line of lines) {
      // Skip comments and empty lines
      if (!line || line.startsWith('#')) {
        continue;
      }

      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        continue;
      }

      const directive = line.substring(0, colonIndex).trim().toLowerCase();
      const value = line.substring(colonIndex + 1).trim();

      if (directive === 'user-agent') {
        currentUserAgent = value.toLowerCase();
        if (!userAgentRules.has(currentUserAgent)) {
          userAgentRules.set(currentUserAgent, { allowed: [], disallowed: [] });
        }
      } else if (directive === 'disallow' && currentUserAgent) {
        const agentRules = userAgentRules.get(currentUserAgent);
        if (agentRules && value) {
          agentRules.disallowed.push(value);
        }
      } else if (directive === 'allow' && currentUserAgent) {
        const agentRules = userAgentRules.get(currentUserAgent);
        if (agentRules && value) {
          agentRules.allowed.push(value);
        }
      } else if (directive === 'crawl-delay' && currentUserAgent) {
        const agentRules = userAgentRules.get(currentUserAgent);
        const delay = parseFloat(value);
        if (agentRules && !isNaN(delay)) {
          agentRules.crawlDelay = delay;
        }
      } else if (directive === 'sitemap') {
        if (value && !rules.sitemaps.includes(value)) {
          rules.sitemaps.push(value);
        }
      }
    }

    // Merge rules for our bot and wildcard
    const ourBotRules = userAgentRules.get('riventabot') || userAgentRules.get('riventabot/1.0');
    const wildcardRules = userAgentRules.get('*');

    if (ourBotRules) {
      rules.allowed = ourBotRules.allowed;
      rules.disallowed = ourBotRules.disallowed;
      rules.crawlDelay = ourBotRules.crawlDelay;
    } else if (wildcardRules) {
      rules.allowed = wildcardRules.allowed;
      rules.disallowed = wildcardRules.disallowed;
      rules.crawlDelay = wildcardRules.crawlDelay;
    }

    return rules;
  }

  /**
   * Create default rules that allow all crawling
   */
  private createDefaultRules(baseUrl: string): RobotsRules {
    return {
      userAgent: '*',
      allowed: ['/'],
      disallowed: [],
      crawlDelay: undefined,
      sitemaps: [],
    };
  }

  /**
   * Check if a URL is allowed to be crawled
   */
  async isAllowed(url: string, userAgent: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
      const path = urlObj.pathname + urlObj.search;

      const rules = await this.fetchRobotsTxt(baseUrl);

      // Check if explicitly allowed
      for (const allowedPath of rules.allowed) {
        if (this.matchesPattern(path, allowedPath)) {
          return true;
        }
      }

      // Check if disallowed
      for (const disallowedPath of rules.disallowed) {
        if (this.matchesPattern(path, disallowedPath)) {
          // Check if there's a more specific allow rule
          for (const allowedPath of rules.allowed) {
            if (allowedPath.length > disallowedPath.length && this.matchesPattern(path, allowedPath)) {
              return true;
            }
          }
          return false;
        }
      }

      // If no rules match, allow by default
      return true;
    } catch (error) {
      console.warn(`Error checking if URL is allowed: ${url}`, error);
      // On error, allow crawling by default
      return true;
    }
  }

  /**
   * Check if a path matches a robots.txt pattern
   */
  private matchesPattern(path: string, pattern: string): boolean {
    if (pattern === '/') {
      return true;
    }

    // Handle wildcards
    if (pattern.includes('*')) {
      const regexPattern = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
        .replace(/\*/g, '.*'); // Convert * to .*
      const regex = new RegExp(`^${regexPattern}`);
      return regex.test(path);
    }

    // Simple prefix match
    return path.startsWith(pattern);
  }

  /**
   * Get crawl delay for a domain
   */
  async getCrawlDelay(baseUrl: string, userAgent: string): Promise<number | undefined> {
    try {
      const rules = await this.fetchRobotsTxt(baseUrl);
      return rules.crawlDelay;
    } catch (error) {
      console.warn(`Error getting crawl delay for ${baseUrl}:`, error);
      return undefined;
    }
  }

  /**
   * Get sitemaps for a domain
   */
  async getSitemaps(baseUrl: string): Promise<string[]> {
    try {
      const rules = await this.fetchRobotsTxt(baseUrl);
      return rules.sitemaps;
    } catch (error) {
      console.warn(`Error getting sitemaps for ${baseUrl}:`, error);
      return [];
    }
  }

  /**
   * Check if URL can be crawled (alias for isAllowed)
   */
  async canCrawl(url: string, userAgent: string): Promise<boolean> {
    return this.isAllowed(url, userAgent);
  }

  /**
   * Clear cache for a specific domain or all domains
   */
  clearCache(baseUrl?: string): void {
    if (baseUrl) {
      this.cache.delete(baseUrl);
      this.cacheExpiry.delete(baseUrl);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isCacheExpired(baseUrl: string): boolean {
    const expiry = this.cacheExpiry.get(baseUrl);
    if (!expiry) return true;
    return Date.now() > expiry;
  }
}

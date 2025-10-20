/**
 * Rate limiter for ethical web crawling
 * Implements token bucket algorithm
 */

import { RateLimiterConfig } from './types';

export class RateLimiter {
  private config: RateLimiterConfig;
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per millisecond

  constructor(config: RateLimiterConfig) {
    this.config = config;
    this.maxTokens = config.requestsPerSecond;
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    // Calculate refill rate: tokens per millisecond
    this.refillRate = config.requestsPerSecond / 1000;
  }

  /**
   * Acquire a token, waiting if necessary
   * Returns a promise that resolves when a token is available
   */
  async acquire(): Promise<void> {
    const delay = this.getDelay();
    
    if (delay > 0) {
      await this.sleep(delay);
    }

    // Refill tokens based on time elapsed
    this.refillTokens();

    // Consume one token
    this.tokens = Math.max(0, this.tokens - 1);
  }

  /**
   * Calculate delay needed before next request can be made
   * Returns delay in milliseconds
   */
  getDelay(): number {
    this.refillTokens();

    if (this.tokens >= 1) {
      return 0;
    }

    // Calculate how long until we have at least 1 token
    const tokensNeeded = 1 - this.tokens;
    const delayMs = Math.ceil(tokensNeeded / this.refillRate);

    return Math.max(delayMs, 0);
  }

  /**
   * Reset the rate limiter to initial state
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  /**
   * Refill tokens based on time elapsed since last refill
   */
  private refillTokens(): void {
    const now = Date.now();
    const timeSinceLastRefill = now - this.lastRefill;

    if (timeSinceLastRefill > 0) {
      const tokensToAdd = timeSinceLastRefill * this.refillRate;
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update rate limit configuration
   */
  updateConfig(config: Partial<RateLimiterConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.requestsPerSecond !== undefined) {
      this.maxTokens = config.requestsPerSecond;
      this.refillRate = config.requestsPerSecond / 1000;
      this.tokens = Math.min(this.tokens, this.maxTokens);
    }
  }

  /**
   * Get current status of the rate limiter
   */
  getStatus(): {
    availableTokens: number;
    maxTokens: number;
    nextAvailableIn: number;
  } {
    this.refillTokens();
    
    return {
      availableTokens: this.tokens,
      maxTokens: this.maxTokens,
      nextAvailableIn: this.getDelay(),
    };
  }
}

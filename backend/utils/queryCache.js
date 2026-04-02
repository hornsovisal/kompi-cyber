/**
 * Database query caching and optimization utilities
 */

class QueryCache {
  constructor(ttl = 300000) {
    // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Generate cache key from query and parameters
   */
  generateKey(query, params = []) {
    const paramString = JSON.stringify(params);
    return `${query}::${paramString}`;
  }

  /**
   * Get cached result if available and not expired
   */
  get(query, params) {
    const key = this.generateKey(query, params);
    const cached = this.cache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  /**
   * Store result in cache
   */
  set(query, params, result) {
    const key = this.generateKey(query, params);
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + this.ttl,
    });
  }

  /**
   * Invalidate specific cache entries
   */
  invalidate(query = null, params = null) {
    if (!query) {
      this.cache.clear();
      return;
    }
    const key = this.generateKey(query, params);
    this.cache.delete(key);
  }

  /**
   * Clear expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache) {
      if (value.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const globalCache = new QueryCache();

// Cleanup every 10 minutes
setInterval(() => globalCache.cleanup(), 600000);

module.exports = {
  QueryCache,
  globalCache,
};

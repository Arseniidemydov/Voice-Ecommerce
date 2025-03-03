/**
 * Simple in-memory cache for product search results
 * This helps reduce repeated API calls for the same queries
 */

class ProductCache {
  constructor(maxSize = 50, ttlMinutes = 60) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  /**
   * Get cached result for a query
   * @param {string} query - The search query
   * @returns {Object|null} - Cached result or null if not found/expired
   */
  get(query) {
    const normalizedQuery = this.normalizeQuery(query);
    
    if (!this.cache.has(normalizedQuery)) {
      return null;
    }
    
    const cachedItem = this.cache.get(normalizedQuery);
    const now = Date.now();
    
    // Check if the cached item has expired
    if (now - cachedItem.timestamp > this.ttlMs) {
      this.cache.delete(normalizedQuery);
      return null;
    }
    
    console.log(`Cache hit for query: "${normalizedQuery}"`);
    return cachedItem.data;
  }

  /**
   * Store result in cache
   * @param {string} query - The search query
   * @param {Object} data - The data to cache
   */
  set(query, data) {
    const normalizedQuery = this.normalizeQuery(query);
    
    // If cache is at max size, remove the oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(normalizedQuery, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`Cached results for query: "${normalizedQuery}"`);
  }

  /**
   * Normalize the query string for consistent cache keys
   * @param {string} query - The original query
   * @returns {string} - Normalized query for cache key
   */
  normalizeQuery(query) {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Clear expired cache entries
   */
  cleanup() {
    const now = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttlMs) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttlMinutes: this.ttlMs / (60 * 1000)
    };
  }
}

module.exports = new ProductCache();

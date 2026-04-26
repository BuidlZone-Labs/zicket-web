/**
 * In-memory cache implementation for public data
 * 
 * Privacy guarantees:
 * - Only caches public, non-user-specific data
 * - Uses in-memory storage only (no persistent storage)
 * - Never includes user identifiers in cache keys
 * - TTL-based expiration ensures stale data doesn't leak
 * - Each request remains stateless and independent
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class InMemoryCache {
  private static store = new Map<string, CacheEntry<unknown>>();
  
  /**
   * Get cached data if it exists and hasn't expired
   */
  static get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if cache has expired
    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.store.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Set data in cache with TTL
   * @param key - Cache key (should NOT contain user identifiers)
   * @param data - Data to cache (public data only)
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   */
  static set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
  
  /**
   * Clear specific cache entry
   */
  static delete(key: string): void {
    this.store.delete(key);
  }
  
  /**
   * Clear all cache entries
   * Useful for testing or forced refresh
   */
  static clear(): void {
    this.store.clear();
  }
  
  /**
   * Get or fetch data from cache
   * If not in cache, fetch using the provided function and cache the result
   * 
   * @param key - Cache key (should NOT contain user identifiers)
   * @param fetcher - Function to fetch data if not cached
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   * @returns Cached or newly fetched data
   */
  static async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch fresh data
    const data = await fetcher();
    
    // Store in cache
    this.set(key, data, ttl);
    
    return data;
  }
  
  /**
   * Get cache statistics (for debugging/monitoring)
   */
  static getStats() {
    return {
      totalEntries: this.store.size,
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        expired: Date.now() - entry.timestamp > entry.ttl,
      })),
    };
  }
}

export default InMemoryCache;
// Contributed via automated bounty system

/**
 * In-memory LRU cache for public data
 *
 * Privacy guarantees:
 * - Only caches public, non-user-specific data
 * - Uses in-memory storage only (no persistent storage)
 * - Never includes user identifiers in cache keys
 * - TTL-based expiration ensures stale data doesn't leak
 * - Each request remains stateless and independent
 *
 * Memory guarantees:
 * - The store is capped at `maxEntries` (configurable via CACHE_MAX_ENTRIES)
 * - Expired entries are pruned before anything is evicted for capacity
 * - Once at capacity, the least recently used entry is evicted first
 *
 * Deployment note: this cache lives in a single process, so it is per-instance
 * and is lost on cold starts. It is a hot-path layer only — durable, shared
 * caching is handled by Next.js `unstable_cache` in lib/dataFetching.ts (and
 * can be swapped for Redis/Upstash there without touching this module).
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_ENTRIES = 500;

const resolveMaxEntries = (): number => {
  const configured = Number.parseInt(process.env.CACHE_MAX_ENTRIES ?? '', 10);

  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_ENTRIES;
};

/**
 * Keep a single store across module re-evaluations (dev HMR), otherwise every
 * reload would leak a fresh Map that the old closures still reference.
 */
const globalScope = globalThis as typeof globalThis & {
  __zicketCacheStore?: Map<string, CacheEntry<unknown>>;
};

const cacheStore: Map<string, CacheEntry<unknown>> = (globalScope.__zicketCacheStore ??=
  new Map<string, CacheEntry<unknown>>());

class InMemoryCache {
  private static store = cacheStore;
  private static maxEntries = resolveMaxEntries();
  private static evictions = 0;
  /** Bumped on clear() so in-flight fetches can tell their result is stale. */
  private static generation = 0;

  /**
   * Change the capacity at runtime. Shrinking the cap evicts immediately.
   */
  static configure({ maxEntries }: { maxEntries: number }): void {
    if (!Number.isInteger(maxEntries) || maxEntries <= 0) {
      throw new Error('maxEntries must be a positive integer');
    }

    this.maxEntries = maxEntries;
    this.enforceCapacity();
  }

  private static isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Drop every expired entry. Safe to call at any time; also runs automatically
   * before capacity-based eviction.
   */
  static prune(): void {
    for (const [key, entry] of this.store) {
      if (this.isExpired(entry)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Evict expired entries first, then the least recently used ones until the
   * store fits within its capacity. A Map iterates in insertion order and every
   * read/write re-inserts its key, so the oldest key is the least recently used.
   */
  private static enforceCapacity(): void {
    if (this.store.size <= this.maxEntries) {
      return;
    }

    this.prune();

    for (const key of this.store.keys()) {
      if (this.store.size <= this.maxEntries) {
        break;
      }

      this.store.delete(key);
      this.evictions += 1;
    }
  }

  /**
   * Get cached data if it exists and hasn't expired
   */
  static get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache has expired
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }

    // Mark as most recently used
    this.store.delete(key);
    this.store.set(key, entry);

    return entry.data as T;
  }

  /**
   * Set data in cache with TTL
   * @param key - Cache key (should NOT contain user identifiers)
   * @param data - Data to cache (public data only)
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   */
  static set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    if (!Number.isFinite(ttl) || ttl <= 0) {
      this.store.delete(key);
      return;
    }

    // Re-insert so the key moves to the most-recently-used end of the Map
    this.store.delete(key);
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    this.enforceCapacity();
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
    this.evictions = 0;
    this.generation += 1;
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
    ttl: number = DEFAULT_TTL
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const generation = this.generation;
    const data = await fetcher();

    // Only cache it if nothing invalidated the store while we were awaiting,
    // otherwise this write would resurrect data that was just cleared
    if (generation === this.generation) {
      this.set(key, data, ttl);
    }

    return data;
  }

  /**
   * Get cache statistics (for debugging/monitoring)
   */
  static getStats() {
    return {
      totalEntries: this.store.size,
      maxEntries: this.maxEntries,
      evictions: this.evictions,
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        expired: this.isExpired(entry),
      })),
    };
  }
}

export { DEFAULT_TTL, DEFAULT_MAX_ENTRIES };
export default InMemoryCache;

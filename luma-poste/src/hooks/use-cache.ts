"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Types
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheConfig {
  maxSize?: number;
  defaultTtl?: number; // Time to live in milliseconds
  persistToStorage?: boolean;
  storageKey?: string;
}

interface UseCacheOptions<T> {
  key: string;
  ttl?: number;
  fallback?: T;
  enabled?: boolean;
  onCacheHit?: (data: T) => void;
  onCacheMiss?: () => void;
  serialize?: (data: T) => string;
  deserialize?: (data: string) => T;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 100,
      defaultTtl: config.defaultTtl ?? 5 * 60 * 1000, // 5 minutes
      persistToStorage: config.persistToStorage ?? false,
      storageKey: config.storageKey ?? "luma-cache",
    };

    if (this.config.persistToStorage && typeof window !== "undefined") {
      this.loadFromStorage();
    }

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, entry]) => {
          const cacheEntry = entry as CacheEntry<any>;
          if (cacheEntry.expiry > Date.now()) {
            this.cache.set(key, cacheEntry);
          }
        });
      }
    } catch (error) {
      console.warn("Failed to load cache from storage:", error);
    }
  }

  private saveToStorage() {
    if (!this.config.persistToStorage || typeof window === "undefined") return;

    try {
      const cacheObject = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.config.storageKey, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn("Failed to save cache to storage:", error);
    }
  }

  private cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (entry.expiry <= now) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0 && this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  private evictOldest() {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiry <= Date.now()) {
      this.cache.delete(key);
      if (this.config.persistToStorage) {
        this.saveToStorage();
      }
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiry = now + (ttl ?? this.config.defaultTtl);

    // Evict oldest if cache is full
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiry,
    });

    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0 && this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  clear(): void {
    this.cache.clear();
    if (this.config.persistToStorage) {
      localStorage.removeItem(this.config.storageKey);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        expiry: entry.expiry,
        isExpired: entry.expiry <= Date.now(),
      })),
    };
  }
}

// Global cache instance
const globalCache = new CacheManager({
  maxSize: 200,
  defaultTtl: 5 * 60 * 1000, // 5 minutes
  persistToStorage: true,
  storageKey: "lumapost-cache",
});

// Main hook
export function useCache<T>(options: UseCacheOptions<T>) {
  const {
    key,
    ttl,
    fallback,
    enabled = true,
    onCacheHit,
    onCacheMiss,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const [data, setData] = useState<T | null>(() => {
    if (!enabled) return fallback ?? null;

    try {
      const cached = globalCache.get<T>(key);
      if (cached !== null) {
        onCacheHit?.(cached);
        return cached;
      }
    } catch (error) {
      console.warn(`Failed to get cached data for key ${key}:`, error);
    }

    onCacheMiss?.();
    return fallback ?? null;
  });

  const set = useCallback(
    (newData: T) => {
      if (!enabled) return;

      try {
        globalCache.set(key, newData, ttl);
        setData(newData);
      } catch (error) {
        console.warn(`Failed to set cache for key ${key}:`, error);
        setData(newData);
      }
    },
    [key, ttl, enabled]
  );

  const invalidate = useCallback(() => {
    globalCache.invalidate(key);
    setData(fallback ?? null);
  }, [key, fallback]);

  const refresh = useCallback(() => {
    if (!enabled) return null;

    try {
      const cached = globalCache.get<T>(key);
      if (cached !== null) {
        setData(cached);
        onCacheHit?.(cached);
        return cached;
      }
    } catch (error) {
      console.warn(`Failed to refresh cache for key ${key}:`, error);
    }

    onCacheMiss?.();
    setData(fallback ?? null);
    return null;
  }, [key, enabled, fallback, onCacheHit, onCacheMiss]);

  return {
    data,
    set,
    invalidate,
    refresh,
    isFromCache: data !== null && data !== fallback,
  };
}

// Hook for fetching data with cache
export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: Omit<UseCacheOptions<T>, "key"> & {
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
    retryCount?: number;
    retryDelay?: number;
  } = {}
) {
  const {
    ttl,
    fallback,
    enabled = true,
    refetchOnMount = false,
    refetchOnWindowFocus = false,
    retryCount = 3,
    retryDelay = 1000,
    ...cacheOptions
  } = options;

  const cache = useCache<T>({ key, ttl, fallback, enabled, ...cacheOptions });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const retryCountRef = useRef(0);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // Use cached data if available and not forcing refresh
    if (!force && cache.data !== null && cache.data !== fallback) {
      return cache.data;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cache.set(result);
      retryCountRef.current = 0;
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => fetchData(force), retryDelay * retryCountRef.current);
        return;
      }

      setError(error);
      console.error(`Failed to fetch data for key ${key}:`, error);
    } finally {
      setLoading(false);
    }
  }, [enabled, cache, fallback, fetcher, key, retryCount, retryDelay]);

  // Initial fetch or refetch on mount
  useEffect(() => {
    if (enabled && (refetchOnMount || cache.data === null || cache.data === fallback)) {
      fetchData();
    }
  }, [enabled, refetchOnMount, fetchData, cache.data, fallback]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;

    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, enabled, fetchData]);

  const mutate = useCallback(async (newData?: T) => {
    if (newData !== undefined) {
      cache.set(newData);
    } else {
      await fetchData(true);
    }
  }, [cache, fetchData]);

  return {
    data: cache.data,
    loading,
    error,
    mutate,
    invalidate: cache.invalidate,
    refetch: () => fetchData(true),
    isFromCache: cache.isFromCache,
  };
}

// Hook for cache management
export function useCacheManager() {
  const [stats, setStats] = useState(globalCache.getStats());

  const updateStats = useCallback(() => {
    setStats(globalCache.getStats());
  }, []);

  useEffect(() => {
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [updateStats]);

  const invalidatePattern = useCallback((pattern: string) => {
    globalCache.invalidatePattern(pattern);
    updateStats();
  }, [updateStats]);

  const clear = useCallback(() => {
    globalCache.clear();
    updateStats();
  }, [updateStats]);

  const invalidate = useCallback((key: string) => {
    globalCache.invalidate(key);
    updateStats();
  }, [updateStats]);

  return {
    stats,
    invalidatePattern,
    clear,
    invalidate,
    refresh: updateStats,
  };
}

// Utility function to create cache keys
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  return `${prefix}:${JSON.stringify(sortedParams)}`;
}

// Export cache manager for direct access if needed
export { globalCache as cacheManager };

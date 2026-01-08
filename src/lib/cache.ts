/**
 * 缓存工具
 * 提供统一的缓存管理接口
 */

const CACHE_PREFIX = 'byvibe_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 分钟

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * 获取缓存键
 */
function getCacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

/**
 * 检查缓存项是否过期
 */
function isExpired(item: CacheItem<any>): boolean {
  return Date.now() - item.timestamp > item.ttl;
}

/**
 * 本地存储缓存
 */
export const cache = {
  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(getCacheKey(key), JSON.stringify(item));
    } catch (error) {
      console.warn('[Cache] Failed to set cache:', error);
    }
  },

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(getCacheKey(key));
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);
      if (isExpired(item)) {
        this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('[Cache] Failed to get cache:', error);
      return null;
    }
  },

  /**
   * 删除缓存
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(getCacheKey(key));
    } catch (error) {
      console.warn('[Cache] Failed to remove cache:', error);
    }
  },

  /**
   * 清空所有缓存
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('[Cache] Failed to clear cache:', error);
    }
  },

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  },
};

/**
 * React Query 缓存配置
 */
export const queryCacheConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分钟
      cacheTime: 10 * 60 * 1000, // 10 分钟
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
};

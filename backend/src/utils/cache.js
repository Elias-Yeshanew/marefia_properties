class MemoryCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Set a value in the cache with a key and TTL.
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
     */
    set(key, value, ttlMs = 300000) {
        const expiresAt = Date.now() + ttlMs;
        this.cache.set(key, { value, expiresAt });
        console.log(`[Cache System] Saved data under key: "${key}" (TTL: ${ttlMs / 1000}s)`);
    }

    /**
     * Get a value from the cache.
     * @param {string} key - Cache key
     * @returns {*} Cached value or null if expired/not found
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            console.log(`[Cache System] Cache MISS for key: "${key}"`);
            return null;
        }

        if (Date.now() > item.expiresAt) {
            console.log(`[Cache System] Cache EXPIRED/MISS for key: "${key}"`);
            this.cache.delete(key);
            return null;
        }

        console.log(`[Cache System] Cache HIT for key: "${key}"`);
        return item.value;
    }

    /**
     * Delete a specific cache key.
     * @param {string} key - Cache key
     */
    delete(key) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            console.log(`[Cache System] Deleted key: "${key}"`);
        }
    }

    /**
     * Clear all cached keys.
     */
    clear() {
        this.cache.clear();
        console.log('[Cache System] Entire cache cleared.');
    }
}

const cacheInstance = new MemoryCache();
module.exports = cacheInstance;

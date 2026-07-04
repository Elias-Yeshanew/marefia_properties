import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const responseCache = new Map();
const CACHE_TTL_MS = 60000; // Cache for 1 minute

const getCacheKey = (config) => {
    const serializedParams = config.params ? JSON.stringify(config.params) : '';
    return `${config.url}?${serializedParams}`;
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to requests & serve cache
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Cache GET requests to public approved listings
        if (config.method === 'get' && config.url && config.url.includes('/listings/approved')) {
            const cacheKey = getCacheKey(config);
            const cachedItem = responseCache.get(cacheKey);
            if (cachedItem && Date.now() < cachedItem.expiresAt) {
                console.log(`[Frontend Cache] HIT: Serving cached response for key: ${cacheKey}`);
                config.adapter = () => {
                    return Promise.resolve({
                        data: cachedItem.data,
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config,
                    });
                };
            } else if (cachedItem) {
                responseCache.delete(cacheKey);
                console.log(`[Frontend Cache] EXPIRED: Deleting key: ${cacheKey}`);
            } else {
                console.log(`[Frontend Cache] MISS: Requesting from server for key: ${cacheKey}`);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to cache responses & handle expired tokens globally
api.interceptors.response.use(
    (response) => {
        const { config } = response;

        // Store GET response in cache
        if (config.method === 'get' && config.url && config.url.includes('/listings/approved')) {
            const cacheKey = getCacheKey(config);
            responseCache.set(cacheKey, {
                data: response.data,
                expiresAt: Date.now() + CACHE_TTL_MS,
            });
            console.log(`[Frontend Cache] STORED: Cached response for key: ${cacheKey}`);
        }

        // Invalidate cache on mutations (POST, PUT, DELETE)
        if (config.method && ['post', 'put', 'delete'].includes(config.method.toLowerCase())) {
            let cleared = false;
            for (const key of responseCache.keys()) {
                if (key.includes('/listings')) {
                    responseCache.delete(key);
                    cleared = true;
                }
            }
            if (cleared) {
                console.log(`[Frontend Cache] INVALIDATED: Cleared all listings cache due to mutation: ${config.method.toUpperCase()} ${config.url}`);
            }
        }

        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized: Token expired or invalid. Logging out...');
            localStorage.removeItem('token');
            responseCache.clear();
        }
        return Promise.reject(error);
    }
);

export default api;
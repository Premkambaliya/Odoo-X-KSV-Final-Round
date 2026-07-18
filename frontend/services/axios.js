import axios from 'axios';
import { APP_ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/lib/apiResponse';
import {
  buildCacheKey,
  getCached,
  invalidateByRequestUrl,
  isFresh,
  isUsable,
  setCached,
  CACHE_TTL,
} from '@/lib/queryCache';
import { clearAuthStorage, getToken } from '@/utils/storage';
import notify from '@/lib/toast';

const MUTATING = new Set(['post', 'put', 'patch', 'delete']);

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function isAuthCredentialRequest(config) {
  const url = config?.url || '';
  return url.includes('/auth/login') || url.includes('/auth/register');
}

function shouldUseCache(config) {
  if (!config) return false;
  if (config.cache === false) return false;
  if (String(config.method || 'get').toLowerCase() !== 'get') return false;
  if (config.responseType && config.responseType !== 'json') return false;
  const url = config.url || '';
  // Never cache auth credential / export streams
  if (url.includes('/export/')) return false;
  if (url.includes('/auth/login') || url.includes('/auth/register')) return false;
  return true;
}

function resolveCacheKey(config) {
  return (
    config.cacheKey ||
    buildCacheKey(config.method, config.url, config.params)
  );
}

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (shouldUseCache(config)) {
      const key = resolveCacheKey(config);
      const entry = getCached(key);
      const ttl = config.cacheTtl ?? CACHE_TTL.default;

      if (entry && isFresh(entry, ttl)) {
        config.adapter = async () => ({
          data: entry.data,
          status: 200,
          statusText: 'OK (cache)',
          headers: { 'x-crms-cache': 'HIT' },
          config,
          request: {},
        });
        return config;
      }

      // Stale-while-revalidate: attach stale payload for callers that want instant UI
      if (entry && isUsable(entry, CACHE_TTL.stale)) {
        config.__staleCache = entry.data;
        config.__cacheKey = key;
      } else {
        config.__cacheKey = key;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const config = response.config || {};
    const method = String(config.method || 'get').toLowerCase();

    if (shouldUseCache(config) && response.status >= 200 && response.status < 300) {
      const key = config.__cacheKey || resolveCacheKey(config);
      setCached(key, response.data);
    }

    if (MUTATING.has(method) && response.status >= 200 && response.status < 300) {
      invalidateByRequestUrl(config.url);
      // Also clear related families commonly affected by mutations
      if (config.url?.includes('/rental-items') || config.url?.includes('/rental-orders')) {
        invalidateByRequestUrl('/rental-orders');
        invalidateByRequestUrl('/dashboard');
        invalidateByRequestUrl('/reports');
      }
      if (config.url?.includes('/payments')) {
        invalidateByRequestUrl('/dashboard');
        invalidateByRequestUrl('/reports');
      }
      if (config.url?.includes('/vehicles')) {
        invalidateByRequestUrl('/price-lists');
      }
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = getErrorMessage(error);
    const authAttempt = isAuthCredentialRequest(error.config);

    if (!error.response) {
      notify.error(message || 'Network error. Please try again.');
      return Promise.reject(error);
    }

    if (status === 401) {
      if (!authAttempt) {
        clearAuthStorage();
        invalidateByRequestUrl();
        notify.error(message || 'Session expired. Please log in again.');

        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== APP_ROUTES.LOGIN
        ) {
          window.location.href = APP_ROUTES.LOGIN;
        }
      }

      return Promise.reject(error);
    }

    if (status === 403) {
      notify.error(message || 'You do not have permission to perform this action.');
      return Promise.reject(error);
    }

    if (status >= 500) {
      notify.error(message || 'Server error. Please try again later.');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;

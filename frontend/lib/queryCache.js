/**
 * Lightweight in-memory GET cache with TTL + stale-while-revalidate support.
 * Shared across the app so revisiting pages feels instant.
 */

const store = new Map();

const DEFAULT_TTL_MS = 45_000;
const DEFAULT_STALE_MS = 120_000;

function now() {
  return Date.now();
}

export function buildCacheKey(method, url, params) {
  const normalizedMethod = String(method || 'get').toLowerCase();
  let paramKey = '';
  if (params && typeof params === 'object') {
    try {
      paramKey = JSON.stringify(params, Object.keys(params).sort());
    } catch {
      paramKey = String(params);
    }
  }
  return `${normalizedMethod}:${url}:${paramKey}`;
}

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  return entry;
}

export function isFresh(entry, ttlMs = DEFAULT_TTL_MS) {
  if (!entry) return false;
  return now() - entry.timestamp < ttlMs;
}

export function isUsable(entry, staleMs = DEFAULT_STALE_MS) {
  if (!entry) return false;
  return now() - entry.timestamp < staleMs;
}

export function setCached(key, data, meta = {}) {
  store.set(key, {
    data,
    timestamp: now(),
    meta,
  });
}

export function invalidateCache(matcher) {
  if (!matcher) {
    store.clear();
    return;
  }

  if (typeof matcher === 'string') {
    for (const key of store.keys()) {
      if (key.includes(matcher)) store.delete(key);
    }
    return;
  }

  if (matcher instanceof RegExp) {
    for (const key of store.keys()) {
      if (matcher.test(key)) store.delete(key);
    }
  }
}

/** Invalidate related list/detail caches after a mutation URL. */
export function invalidateByRequestUrl(url = '') {
  const path = String(url).split('?')[0];
  if (!path) {
    store.clear();
    return;
  }

  // Invalidate the resource family, e.g. /vehicles/123 -> /vehicles
  const parts = path.replace(/\/+$/, '').split('/').filter(Boolean);
  const root = parts.length >= 1 ? `/${parts[0]}` : path;
  invalidateCache(root);
}

export function getCacheStats() {
  return { size: store.size };
}

export const CACHE_TTL = {
  short: 20_000,
  default: DEFAULT_TTL_MS,
  long: 90_000,
  stale: DEFAULT_STALE_MS,
};

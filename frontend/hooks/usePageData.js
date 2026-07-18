'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '@/lib/apiResponse';
import {
  buildCacheKey,
  getCached,
  isUsable,
  CACHE_TTL,
} from '@/lib/queryCache';

/**
 * Page data loader with instant cache paint + background refresh.
 *
 * @param {Function} fetcher async () => data
 * @param {object} options
 * @param {string} options.key stable cache key
 * @param {Array} options.deps reload dependencies
 * @param {boolean} options.enabled
 */
export default function usePageData(fetcher, { key, deps = [], enabled = true } = {}) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const cached = key ? getCached(key) : null;
  const hasWarmCache = Boolean(cached && isUsable(cached, CACHE_TTL.stale));

  const [data, setData] = useState(() => (hasWarmCache ? cached.data : null));
  const [loading, setLoading] = useState(!hasWarmCache);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!enabled) return null;

      if (!silent && !hasWarmCache && data == null) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError('');

      try {
        const result = await fetcherRef.current();
        setData(result);
        return result;
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, key, ...deps]
  );

  useEffect(() => {
    if (!enabled) return undefined;
    load({ silent: hasWarmCache });
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key, ...deps]);

  return {
    data,
    loading,
    refreshing,
    error,
    reload: () => load({ silent: false }),
    setData,
  };
}

export function pageCacheKey(namespace, params = {}) {
  return buildCacheKey('page', namespace, params);
}

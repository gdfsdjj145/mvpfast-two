'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 请求状态
 */
export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * useFetch 配置项
 */
export interface UseFetchOptions<T> {
  /** 是否立即执行请求 */
  immediate?: boolean;
  /** 初始数据 */
  initialData?: T;
  /** 请求成功回调 */
  onSuccess?: (data: T) => void;
  /** 请求失败回调 */
  onError?: (error: Error) => void;
  /** 依赖项，变化时重新请求 */
  deps?: unknown[];
}

/**
 * useFetch 返回值
 */
export interface UseFetchReturn<T> {
  /** 响应数据 */
  data: T | undefined;
  /** 错误信息 */
  error: Error | null;
  /** 请求状态 */
  status: FetchStatus;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否成功 */
  isSuccess: boolean;
  /** 是否出错 */
  isError: boolean;
  /** 手动执行请求 */
  execute: () => Promise<T | undefined>;
  /** 重置状态 */
  reset: () => void;
  /** 手动设置数据 */
  setData: (data: T | undefined) => void;
}

/**
 * 数据请求 Hook
 *
 * 用于管理异步数据请求的状态
 *
 * @example
 * ```tsx
 * function UserList() {
 *   const { data, isLoading, error, execute } = useFetch(
 *     () => fetch('/api/users').then(res => res.json()),
 *     { immediate: true }
 *   );
 *
 *   if (isLoading) return <div>加载中...</div>;
 *   if (error) return <div>错误: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {data?.map(user => <div key={user.id}>{user.name}</div>)}
 *       <button onClick={execute}>刷新</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const {
    immediate = false,
    initialData,
    onSuccess,
    onError,
    deps = [],
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');

  // 使用 ref 存储最新的 fetcher 和回调
  const fetcherRef = useRef(fetcher);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    fetcherRef.current = fetcher;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  const execute = useCallback(async (): Promise<T | undefined> => {
    setStatus('loading');
    setError(null);

    try {
      const result = await fetcherRef.current();
      setData(result);
      setStatus('success');
      onSuccessRef.current?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus('error');
      onErrorRef.current?.(error);
      return undefined;
    }
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setStatus('idle');
  }, [initialData]);

  // 立即执行或依赖变化时执行
  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]);

  return {
    data,
    error,
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    execute,
    reset,
    setData,
  };
}

/**
 * 带缓存的数据请求 Hook
 *
 * @example
 * ```tsx
 * const { data } = useFetchWithCache(
 *   'users-list',
 *   () => fetch('/api/users').then(res => res.json()),
 *   { cacheTime: 60000 } // 缓存 1 分钟
 * );
 * ```
 */
const cache = new Map<string, { data: unknown; timestamp: number }>();

export interface UseFetchWithCacheOptions<T> extends UseFetchOptions<T> {
  /** 缓存时间 (毫秒) */
  cacheTime?: number;
}

export function useFetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseFetchWithCacheOptions<T> = {}
): UseFetchReturn<T> {
  const { cacheTime = 5 * 60 * 1000, ...restOptions } = options;

  const cachedFetcher = useCallback(async (): Promise<T> => {
    const cached = cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < cacheTime) {
      return cached.data as T;
    }

    const data = await fetcher();
    cache.set(key, { data, timestamp: now });
    return data;
  }, [key, cacheTime, fetcher]);

  return useFetch(cachedFetcher, restOptions);
}

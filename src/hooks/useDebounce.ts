'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 防抖值 Hook
 *
 * 当值在指定延迟时间内没有变化时，返回更新后的值
 *
 * @param value - 需要防抖的值
 * @param delay - 延迟时间 (毫秒)
 * @returns 防抖后的值
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 500);
 *
 *   useEffect(() => {
 *     if (debouncedSearch) {
 *       // 执行搜索请求
 *       fetchSearchResults(debouncedSearch);
 *     }
 *   }, [debouncedSearch]);
 *
 *   return (
 *     <input
 *       value={search}
 *       onChange={(e) => setSearch(e.target.value)}
 *       placeholder="搜索..."
 *     />
 *   );
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖函数 Hook
 *
 * 返回一个防抖后的函数，在指定延迟时间后执行
 *
 * @param fn - 需要防抖的函数
 * @param delay - 延迟时间 (毫秒)
 * @param deps - 依赖项
 * @returns 防抖后的函数和取消方法
 *
 * @example
 * ```tsx
 * function SearchForm() {
 *   const [search, setSearch] = useState('');
 *
 *   const { debouncedFn: debouncedSearch, cancel } = useDebounceFn(
 *     (query: string) => {
 *       console.log('搜索:', query);
 *       // 执行搜索请求
 *     },
 *     500
 *   );
 *
 *   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *     const value = e.target.value;
 *     setSearch(value);
 *     debouncedSearch(value);
 *   };
 *
 *   return (
 *     <div>
 *       <input value={search} onChange={handleChange} />
 *       <button onClick={cancel}>取消</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDebounceFn<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number = 500,
  deps: unknown[] = []
): {
  debouncedFn: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
} {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  const argsRef = useRef<Parameters<T> | null>(null);

  // 保持 fn 引用最新
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current && argsRef.current) {
      cancel();
      fnRef.current(...(argsRef.current as Parameters<T>));
    }
  }, [cancel]);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args;
      cancel();
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, cancel, ...deps]
  );

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { debouncedFn, cancel, flush };
}

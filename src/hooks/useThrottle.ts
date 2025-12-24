'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 节流值 Hook
 *
 * 在指定时间间隔内只更新一次值
 *
 * @param value - 需要节流的值
 * @param interval - 时间间隔 (毫秒)
 * @returns 节流后的值
 *
 * @example
 * ```tsx
 * function ScrollTracker() {
 *   const [scrollY, setScrollY] = useState(0);
 *   const throttledScrollY = useThrottle(scrollY, 100);
 *
 *   useEffect(() => {
 *     const handleScroll = () => setScrollY(window.scrollY);
 *     window.addEventListener('scroll', handleScroll);
 *     return () => window.removeEventListener('scroll', handleScroll);
 *   }, []);
 *
 *   // throttledScrollY 每 100ms 最多更新一次
 *   return <div>滚动位置: {throttledScrollY}</div>;
 * }
 * ```
 */
export function useThrottle<T>(value: T, interval: number = 200): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * 节流函数 Hook
 *
 * 返回一个节流后的函数，在指定时间间隔内最多执行一次
 *
 * @param fn - 需要节流的函数
 * @param interval - 时间间隔 (毫秒)
 * @param options - 配置选项
 * @returns 节流后的函数和取消方法
 *
 * @example
 * ```tsx
 * function ResizeHandler() {
 *   const { throttledFn: handleResize } = useThrottleFn(
 *     () => {
 *       console.log('窗口大小:', window.innerWidth, window.innerHeight);
 *     },
 *     200,
 *     { leading: true, trailing: true }
 *   );
 *
 *   useEffect(() => {
 *     window.addEventListener('resize', handleResize);
 *     return () => window.removeEventListener('resize', handleResize);
 *   }, [handleResize]);
 *
 *   return <div>调整窗口大小...</div>;
 * }
 * ```
 */
export interface UseThrottleFnOptions {
  /** 是否在开始时立即执行 */
  leading?: boolean;
  /** 是否在结束时执行 */
  trailing?: boolean;
}

export function useThrottleFn<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  interval: number = 200,
  options: UseThrottleFnOptions = {}
): {
  throttledFn: (...args: Parameters<T>) => void;
  cancel: () => void;
} {
  const { leading = true, trailing = true } = options;

  const fnRef = useRef(fn);
  const lastExecRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  // 保持 fn 引用最新
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    lastArgsRef.current = null;
  }, []);

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = interval - (now - lastExecRef.current);

      lastArgsRef.current = args;

      // 可以立即执行
      if (remaining <= 0 || remaining > interval) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        if (leading || lastExecRef.current !== 0) {
          lastExecRef.current = now;
          fnRef.current(...args);
        }
      } else if (!timerRef.current && trailing) {
        // 设置尾部执行
        timerRef.current = setTimeout(() => {
          lastExecRef.current = leading ? Date.now() : 0;
          timerRef.current = null;
          if (lastArgsRef.current) {
            fnRef.current(...(lastArgsRef.current as Parameters<T>));
          }
        }, remaining);
      }
    },
    [interval, leading, trailing]
  );

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { throttledFn, cancel };
}

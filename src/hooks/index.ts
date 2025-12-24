/**
 * 自定义 Hooks 统一导出
 *
 * @example
 * ```ts
 * import { useAuth, useDebounce, useLocalStorage } from '@/hooks';
 * ```
 */

// 认证相关
export { useAuth } from './useAuth';
export type { AuthUser, UseAuthReturn } from './useAuth';

// 数据请求
export { useFetch, useFetchWithCache } from './useFetch';
export type {
  FetchStatus,
  UseFetchOptions,
  UseFetchReturn,
  UseFetchWithCacheOptions,
} from './useFetch';

// 防抖
export { useDebounce, useDebounceFn } from './useDebounce';

// 节流
export { useThrottle, useThrottleFn } from './useThrottle';
export type { UseThrottleFnOptions } from './useThrottle';

// 本地存储
export { useLocalStorage, useSessionStorage } from './useLocalStorage';
export type { UseLocalStorageReturn } from './useLocalStorage';

// 响应式
export {
  useMediaQuery,
  useBreakpoint,
  usePrefersDark,
  usePrefersReducedMotion,
  breakpoints,
} from './useMediaQuery';

// 剪贴板
export { useCopyToClipboard, useReadClipboard } from './useCopyToClipboard';
export type { CopyStatus, UseCopyToClipboardReturn } from './useCopyToClipboard';

// 交叉观察器
export { useIntersectionObserver } from './useIntersectionObserver';

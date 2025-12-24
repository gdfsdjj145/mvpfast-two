'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * 响应式断点 Hook
 *
 * 监听媒体查询变化，返回是否匹配
 *
 * @param query - 媒体查询字符串
 * @returns 是否匹配媒体查询
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const isMobile = useMediaQuery('(max-width: 768px)');
 *   const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 *
 *   return (
 *     <div>
 *       {isMobile ? <MobileView /> : <DesktopView />}
 *       {isDark && <DarkModeIndicator />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((query: string): boolean => {
    // SSR 时返回 false
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  }, []);

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // 设置初始值
    setMatches(mediaQuery.matches);

    // 监听变化
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 使用 addEventListener (现代浏览器)
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * 预定义断点
 */
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

/**
 * 屏幕尺寸 Hook
 *
 * 提供常用的屏幕尺寸断点判断
 *
 * @returns 各断点的匹配状态
 *
 * @example
 * ```tsx
 * function Layout() {
 *   const { isMobile, isTablet, isDesktop } = useBreakpoint();
 *
 *   if (isMobile) return <MobileLayout />;
 *   if (isTablet) return <TabletLayout />;
 *   return <DesktopLayout />;
 * }
 * ```
 */
export function useBreakpoint() {
  const sm = useMediaQuery(breakpoints.sm);
  const md = useMediaQuery(breakpoints.md);
  const lg = useMediaQuery(breakpoints.lg);
  const xl = useMediaQuery(breakpoints.xl);
  const xxl = useMediaQuery(breakpoints['2xl']);

  return {
    /** 小于 640px */
    isMobile: !sm,
    /** 640px - 768px */
    isTablet: sm && !lg,
    /** 大于等于 1024px */
    isDesktop: lg,
    /** 小于 768px */
    isMobileOrTablet: !md,
    /** 断点状态 */
    breakpoint: {
      sm,
      md,
      lg,
      xl,
      '2xl': xxl,
    },
  };
}

/**
 * 暗色模式检测 Hook
 *
 * @returns 是否为暗色模式
 *
 * @example
 * ```tsx
 * function ThemeWrapper({ children }) {
 *   const prefersDark = usePrefersDark();
 *
 *   return (
 *     <div className={prefersDark ? 'dark' : 'light'}>
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePrefersDark(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * 减少动画偏好检测 Hook
 *
 * @returns 用户是否偏好减少动画
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const prefersReducedMotion = usePrefersReducedMotion();
 *
 *   return (
 *     <div className={prefersReducedMotion ? '' : 'animate-bounce'}>
 *       内容
 *     </div>
 *   );
 * }
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

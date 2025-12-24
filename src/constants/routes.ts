/**
 * 路由常量
 *
 * 集中管理应用中的所有路由路径，避免魔法字符串
 *
 * @example
 * ```tsx
 * import { ROUTES } from '@/constants';
 *
 * <Link href={ROUTES.DASHBOARD.HOME}>控制台</Link>
 * router.push(ROUTES.AUTH.SIGNIN);
 * ```
 */

/**
 * 公共路由
 */
export const PUBLIC_ROUTES = {
  /** 首页 */
  HOME: '/',
  /** 博客 */
  BLOG: '/blog',
  /** 文档 */
  DOCS: '/docs',
} as const;

/**
 * 认证相关路由
 */
export const AUTH_ROUTES = {
  /** 登录 */
  SIGNIN: '/auth/signin',
  /** 注册 */
  SIGNUP: '/auth/signup',
  /** 登出 */
  SIGNOUT: '/auth/signout',
  /** 忘记密码 */
  FORGOT_PASSWORD: '/auth/forgot-password',
  /** 重置密码 */
  RESET_PASSWORD: '/auth/reset-password',
} as const;

/**
 * 仪表盘路由
 */
export const DASHBOARD_ROUTES = {
  /** 仪表盘首页 */
  HOME: '/dashboard/home',
  /** 订单管理 */
  ORDER: '/dashboard/order',
  /** 用户管理 */
  USER: '/dashboard/user',
  /** 个人中心 */
  PERSON: '/dashboard/person',
  /** 分享页面 */
  SHARE: '/dashboard/share',
  /** 数据库演示 */
  DB_DEMO: '/dashboard/dbdemo',
} as const;

/**
 * 支付相关路由
 */
export const PAY_ROUTES = {
  /** 支付页面 */
  PAY: '/pay',
  /** 支付成功 */
  SUCCESS: '/pay/success',
  /** 支付失败 */
  FAILED: '/pay/failed',
} as const;

/**
 * 所有路由的集合
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  AUTH: AUTH_ROUTES,
  DASHBOARD: DASHBOARD_ROUTES,
  PAY: PAY_ROUTES,
} as const;

/**
 * 需要认证的路由前缀
 */
export const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/pay',
] as const;

/**
 * 不需要认证的路由
 */
export const PUBLIC_ROUTE_LIST = [
  '/',
  '/blog',
  '/docs',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
] as const;

/**
 * 检查路由是否需要认证
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * 检查路由是否为公开路由
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTE_LIST.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * 获取带语言前缀的路由
 */
export function getLocalizedRoute(route: string, locale: string = 'zh'): string {
  if (route.startsWith('/')) {
    return `/${locale}${route}`;
  }
  return `/${locale}/${route}`;
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import authConfig from './auth.config';

// 不需要验证的路由列表
const publicRoutes = ['/docs', '/blog', '/api/auth', '/auth/signin'];

// 需要验证的路由列表
const protectedRoutes = ['/pay', '/dashboard'];

// 需要管理员权限的路由
const adminRoutes = ['/dashboard/settings/system'];

// 创建next-intl中间件
const intlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: 'as-needed'
});

// 使用 NextAuth v5 的 auth() 包装器，Edge 兼容
const { auth } = NextAuth(authConfig);

export default auth(async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // 跳过对API路由和Next.js静态文件的特殊处理
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/docs') ||
    pathname.startsWith('/blog') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 提取语言前缀后的实际路径
  let pathnameWithoutLocale = pathname;
  let currentLocale = '';

  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      pathnameWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '');
      currentLocale = locale;
      break;
    }
  }

  // 通过 auth 包装器，session 直接挂在 request 上
  const session = request.auth;
  const isAuthenticated = !!session?.user;

  console.log('当前路径:', pathname, '认证状态:', isAuthenticated);

  // 公开路由直接通过
  if (publicRoutes.some(route => pathnameWithoutLocale.startsWith(route))) {
    return intlMiddleware(request);
  }

  // 受保护路由
  if (protectedRoutes.some(route => pathnameWithoutLocale.startsWith(route))) {
    const isDev = process.env.NODE_ENV === 'development';

    if (!isAuthenticated && !isDev) {
      console.log('未登录访问受保护路由，重定向到登录页');
      let loginPath = '/auth/signin';
      if (currentLocale) {
        loginPath = `/${currentLocale}/auth/signin`;
      }
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set('redirect', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (isDev && !isAuthenticated) {
      console.log('[DEV] 开发环境免登录访问:', pathnameWithoutLocale);
    }

    // 管理员路由检查 - 从 JWT token 中读取 role，无需查数据库
    if (adminRoutes.some(route => pathnameWithoutLocale.startsWith(route))) {
      if (!isDev && isAuthenticated) {
        const userRole = (session as any)?.user?.role || 'user';
        if (userRole !== 'admin') {
          console.log('非管理员访问管理员路由，重定向到首页');
          let forbiddenPath = '/';
          if (currentLocale) {
            forbiddenPath = `/${currentLocale}/`;
          }
          return NextResponse.redirect(new URL(forbiddenPath, request.url));
        }
      }
    }
  }

  // 检查是否是登录后的重定向
  const redirectParam = request.nextUrl.searchParams.get('redirect');
  if (
    isAuthenticated &&
    redirectParam &&
    protectedRoutes.some((route) => {
      for (const locale of routing.locales) {
        if (redirectParam.startsWith(`/${locale}${route}`)) {
          return true;
        }
      }
      return redirectParam.startsWith(route);
    })
  ) {
    return NextResponse.redirect(new URL(redirectParam, request.url));
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

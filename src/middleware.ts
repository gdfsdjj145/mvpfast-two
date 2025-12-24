import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { JWT } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// 不需要验证的路由列表
const publicRoutes = ['/docs', '/blog', '/api/auth', '/auth/signin'];

// 需要验证的路由列表 - 确保包含所有需要保护的路径
const protectedRoutes = ['/pay', '/dashboard'];

// 创建next-intl中间件
const intlMiddleware = createMiddleware({
  // 使用i18n/routing中定义的配置
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: 'as-needed'
});

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // 设置进度条头
  const response = NextResponse.next();
  response.headers.set('X-Progress-Start', 'true');
  
  // 提取可能存在的语言前缀之后的实际路径
  let pathnameWithoutLocale = pathname;
  let currentLocale = '';
  
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      pathnameWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '');
      currentLocale = locale;
      break;
    }
  }
  
  // 跳过对API路由和Next.js静态文件的特殊处理
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/docs') ||
    pathname.startsWith('/blog') ||
    pathname.includes('.')
  ) {
    return response;
  }
  
  // 调试日志
  console.log('当前路径:', pathname);
  console.log('去除语言前缀后的路径:', pathnameWithoutLocale);
  
  // 验证用户认证状态
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not set');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokenParams: any = {
    req: request,
    secret: secret,
  };
  if (process.env.NEXTAUTH_SALT) {
    tokenParams.salt = process.env.NEXTAUTH_SALT;
  }
  let token: JWT | null = await getToken(tokenParams);

  // 如果没有通过getToken获取到token，尝试从cookie中获取
  if (!token) {
    const sessionToken = request.cookies.get('next-auth.session-token');
    if (sessionToken) {
      token = { sessionToken: sessionToken.value } as JWT;
    }
  }

  console.log('token状态:', !!token);
  
  // 检查当前路径是否在公开路由列表中
  if (publicRoutes.some(route => pathnameWithoutLocale.startsWith(route))) {
    // 公开路由直接通过国际化中间件处理
    return intlMiddleware(request);
  }
  
  // 检查当前路径是否在需要保护的路由列表中
  if (protectedRoutes.some(route => pathnameWithoutLocale.startsWith(route))) {
    // 开发环境下跳过认证检查
    const isDev = process.env.NODE_ENV === 'development';

    if (!token && !isDev) {
      console.log('未登录访问受保护路由，重定向到登录页');

      // 构造登录URL时保留语言前缀
      let loginPath = '/auth/signin';
      if (currentLocale) {
        loginPath = `/${currentLocale}/auth/signin`;
      }

      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set('redirect', `${pathname}${search}`);
      console.log('重定向到:', loginUrl.toString());
      return NextResponse.redirect(loginUrl);
    }

    if (isDev && !token) {
      console.log('[DEV] 开发环境免登录访问:', pathnameWithoutLocale);
    }
  }
  
  // 处理登录成功后的重定向
  if (
    pathnameWithoutLocale === '/api/auth/signin/credentials' ||
    pathnameWithoutLocale === '/api/auth/session'
  ) {
    const callbackUrl = request.nextUrl.searchParams.get('redirect');
    if (callbackUrl) {
      console.log('登录成功，重定向到:', callbackUrl);
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
  }

  // 检查是否是登录后的重定向
  const redirectParam = request.nextUrl.searchParams.get('redirect');
  if (
    token &&
    redirectParam &&
    protectedRoutes.some((route) => {
      // 检查重定向参数是否包含受保护路由，考虑可能的语言前缀
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

  // 通过国际化中间件处理其他所有路由
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

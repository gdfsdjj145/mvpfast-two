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
  // 获取URL来确定是否处理国际化
  const { pathname } = request.nextUrl;
  
  // 跳过对API路由和Next.js静态文件的国际化处理
  const shouldHandleLocale = !pathname.startsWith('/api/') && 
                              !pathname.startsWith('/_next/') && 
                              !pathname.startsWith('/docs') &&
                              !pathname.startsWith('/blog') &&
                              !pathname.includes('.');
  
  // 处理国际化路由
  if (shouldHandleLocale) {
    const response = intlMiddleware(request);

    // 如果intlMiddleware有返回，表示它处理了请求(如重定向)，直接返回结果
    if (response) {
      // 设置一个自定义头部来触发客户端的进度条
      response.headers.set('X-Progress-Start', 'true');
      return response;
    }
  }

  // 对于不需要处理国际化的路由，使用原来的中间件逻辑
  const response = NextResponse.next();

  // 设置一个自定义头部来触发客户端的进度条
  response.headers.set('X-Progress-Start', 'true');

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not set');
  }

  let token: JWT | null = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    salt: process.env.NEXTAUTH_SALT,
  });

  // 如果没有通过getToken获取到token，尝试从cookie中获取
  if (!token) {
    const sessionToken = request.cookies.get('next-auth.session-token');
    if (sessionToken) {
      // 这里只是简单地将cookie值赋给token
      // 实际使用时可能需要进行更复杂的解析和验证
      token = { sessionToken: sessionToken.value } as JWT;
    }
  }

  const { search } = request.nextUrl;
  const fullPath = `${pathname}${search}`;

  // 调试日志
  console.log('当前路径:', pathname);
  console.log('token状态:', !!token);

  // 处理登录成功后的重定向
  if (
    pathname === '/api/auth/signin/credentials' ||
    pathname === '/api/auth/session'
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
    protectedRoutes.some((route) => redirectParam.startsWith(route))
  ) {
    return NextResponse.redirect(new URL(redirectParam, request.url));
  }

  // 检查当前路径是否在公开路由列表中
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return response;
  }


  // 检查当前路径是否在需要保护的路由列表中
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      console.log('未登录访问受保护路由，重定向到登录页');
      const loginUrl = new URL('/auth/signin', request.url);
      // 修复重定向URL格式，移除多余的/
      loginUrl.searchParams.set('redirect', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 对于所有其他路由，允许访问
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

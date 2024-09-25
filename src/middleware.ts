import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { JWT } from 'next-auth/jwt';
import NProgress from 'nprogress';

// 不需要验证的路由列表
const publicRoutes = ['/docs', '/blog', '/api/auth', '/auth/signin'];

// 需要验证的路由列表
const protectedRoutes = ['/pay', '/dashboard'];

export async function middleware(request: NextRequest) {
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

  const { pathname, search } = request.nextUrl;
  const fullPath = `${pathname}${search}`;

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
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('redirect', `${pathname}/${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 对于所有其他路由，允许访问
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

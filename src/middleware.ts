import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt";
import { JWT } from 'next-auth/jwt';

// 不需要验证的路由列表
const publicRoutes = ['/docs', '/blog', '/api/auth'];

// 需要验证的路由列表
const protectedRoutes = ['/pay', '/dashboard'];

export async function middleware(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not set');
  }

  let token: JWT | string | null = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    salt: process.env.NEXTAUTH_SALT, // 如果您使用了 salt
  });

  const sessionToken = request.cookies.get('next-auth.session-token')?.value;
  if (sessionToken) {
    console.log('Development mode: Session token found in cookie');
    // 这里你可以根据需要处理 sessionToken
    token = sessionToken;
  }

  const { pathname, search } = request.nextUrl;
  const fullPath = `${pathname}${search}`;

  // 处理登录成功后的重定向
  if (pathname === '/api/auth/signin/credentials' || pathname === '/api/auth/session') {
    const callbackUrl = request.nextUrl.searchParams.get('redirect');
    if (callbackUrl) {
      console.log('登录成功，重定向到:', callbackUrl);
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
  }

  // 检查当前路径是否在公开路由列表中
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 检查当前路径是否在需要保护的路由列表中
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      console.log('用户未登录，重定向到登录页面');
      const loginUrl = new URL('/api/auth/signin', request.url);
      loginUrl.searchParams.set('redirect', fullPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 如果用户已登录且尝试访问登录页面，重定向到首页
  if (token && pathname === '/auth/signin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

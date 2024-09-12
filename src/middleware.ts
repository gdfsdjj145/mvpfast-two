import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 不需要验证的路由列表
const publicRoutes = ['/docs', '/blog', '/api/auth'];

// 需要验证的路由列表
const protectedRoutes = ['/pay'];

export async function middleware(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error('NEXTAUTH_SECRET is not set');
    throw new Error('NEXTAUTH_SECRET is not set');
  }

  console.log('Middleware running for path:', request.nextUrl.pathname);

  let token;
  try {
    token = await getToken({
      req: request,
      secret: secret,
      salt: process.env.NEXTAUTH_SALT,
    });
    console.log('Token:', token);
  } catch (error) {
    console.error('Error getting token:', error);
  }

  const { pathname } = request.nextUrl;

  // 检查当前路径是否在公开路由列表中
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 检查当前路径是否在需要保护的路由列表中
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      console.log('No token found, redirecting to login');
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // 从请求头中获取认证信息
    const authHeader = req.headers.get('authorization');
    const refreshToken = req.cookies.get('sb-refresh-token');
    const accessToken = req.cookies.get('sb-access-token');

    // 添加调试日志
    console.log('Auth Header:', !!authHeader);
    console.log('Refresh Token:', !!refreshToken);
    console.log('Access Token:', !!accessToken);

    // 检查访问的路径是否需要认证
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!session && (!refreshToken || !accessToken)) {
        // 用户未登录，重定向到登录页
        const redirectUrl = new URL('/auth/signin', req.url);
        redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // 如果有 session，设置认证头
      if (session?.access_token) {
        res.headers.set('Authorization', `Bearer ${session.access_token}`);
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // 发生错误时重定向到登录页
    const redirectUrl = new URL('/auth/signin', req.url);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/((?!_next/static|_next/image|favicon.ico|auth/signin).*)',
  ],
};

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 不需要验证的路由列表
const publicRoutes = ['/docs', '/blog', '/api/auth']


export async function middleware(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set")
  }

  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    salt: process.env.NEXTAUTH_SALT // 添加这一行
  })
  const { pathname } = request.nextUrl

  // 检查当前路径是否在公开路由列表中
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }


  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
import { auth } from '@/auth';
import { NextRequest } from 'next/server';

export type AdminUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  role?: string;
  nickName?: string | null;
  avatar?: string | null;
};

/**
 * 验证用户是否为管理员
 * 如果有真实 session，检查真实角色
 * 开发环境下没有 session 时，使用 dev-admin
 */
export async function requireAdmin(): Promise<AdminUser> {
  const session = await auth();

  // 如果有真实 session，使用真实数据并检查权限
  if (session?.user) {
    const userRole = session.user.role || 'user';

    // 检查权限（开发和生产都检查）
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new Error('Forbidden: Admin access required');
    }

    return session.user as AdminUser;
  }

  // 开发环境下没有 session 时，使用 dev-admin
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEV] Admin check bypassed in development mode (no session)');
    // 使用有效的 MongoDB ObjectID 格式（24位十六进制字符）
    return {
      id: '000000000000000000000001',
      role: 'admin',
      nickName: 'Dev Admin',
      email: 'dev@admin.com',
    };
  }

  throw new Error('Unauthorized: Please login first');
}

/**
 * 检查用户是否为管理员（不抛出错误）
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();

  // 如果有 session，检查真实角色
  if (session?.user) {
    const userRole = session.user.role || 'user';
    return userRole === 'admin' || userRole === 'superadmin';
  }

  // 开发环境下没有 session 时，返回 true 以便调试
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return false;
}

/**
 * 从请求中获取客户端信息
 */
export function getClientInfo(request: NextRequest) {
  const ipAddress =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return {
    ipAddress,
    userAgent,
  };
}

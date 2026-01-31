import { auth } from '@/auth';
import { NextRequest } from 'next/server';
import { hasPermission, type Permission } from '@/lib/rbac';

export type AdminUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  role?: string;
  nickName?: string | null;
  avatar?: string | null;
};

/**
 * 获取当前 session 中的用户角色
 */
export async function getSessionRole(): Promise<string> {
  const session = await auth();
  if (session?.user) {
    return (session.user as AdminUser).role || 'user';
  }
  if (process.env.NODE_ENV === 'development') {
    return 'admin';
  }
  throw new Error('Unauthorized: Please login first');
}

/**
 * 验证用户是否为管理员（向后兼容，内部使用 RBAC）
 * 签名不变，所有 API 路由无需修改
 */
export async function requireAdmin(): Promise<AdminUser> {
  const session = await auth();

  if (session?.user) {
    const userRole = (session.user as AdminUser).role || 'user';

    if (!hasPermission(userRole, 'user:list')) {
      throw new Error('Forbidden: Admin access required');
    }

    return session.user as AdminUser;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[DEV] Admin check bypassed in development mode (no session)');
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
 * 检查用户是否为管理员（不抛出错误，向后兼容）
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();

  if (session?.user) {
    const userRole = (session.user as AdminUser).role || 'user';
    return hasPermission(userRole, 'user:list');
  }

  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return false;
}

/**
 * 按权限粒度检查，抛出错误
 */
export async function requirePermission(permission: Permission): Promise<AdminUser> {
  const session = await auth();

  if (session?.user) {
    const userRole = (session.user as AdminUser).role || 'user';

    if (!hasPermission(userRole, permission)) {
      throw new Error(`Forbidden: Missing permission '${permission}'`);
    }

    return session.user as AdminUser;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Permission check bypassed in development mode (no session) - ${permission}`);
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

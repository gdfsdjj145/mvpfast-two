'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback, useMemo } from 'react';

/**
 * 用户信息类型
 */
export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
}

/**
 * useAuth 返回值类型
 */
export interface UseAuthReturn {
  /** 用户信息 */
  user: AuthUser | null;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否未认证 */
  isUnauthenticated: boolean;
  /** 登录方法 */
  login: (provider?: string, options?: Record<string, unknown>) => Promise<void>;
  /** 登出方法 */
  logout: (callbackUrl?: string) => Promise<void>;
  /** 刷新会话 */
  refresh: () => Promise<void>;
}

/**
 * 认证状态 Hook
 *
 * 封装 next-auth 的 useSession，提供更便捷的认证状态访问
 *
 * @example
 * ```tsx
 * function Profile() {
 *   const { user, isAuthenticated, isLoading, logout } = useAuth();
 *
 *   if (isLoading) return <div>加载中...</div>;
 *   if (!isAuthenticated) return <div>请先登录</div>;
 *
 *   return (
 *     <div>
 *       <p>欢迎, {user?.name}</p>
 *       <button onClick={() => logout()}>登出</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const isUnauthenticated = status === 'unauthenticated';

  const user = useMemo<AuthUser | null>(() => {
    if (!session?.user) return null;
    const sessionUser = session.user as AuthUser;
    return {
      id: sessionUser.id || '',
      name: sessionUser.name,
      email: sessionUser.email,
      phone: sessionUser.phone,
      image: sessionUser.image,
    };
  }, [session?.user]);

  const login = useCallback(
    async (provider?: string, options?: Record<string, unknown>) => {
      await signIn(provider, options);
    },
    []
  );

  const logout = useCallback(async (callbackUrl?: string) => {
    await signOut({ callbackUrl: callbackUrl || '/' });
  }, []);

  const refresh = useCallback(async () => {
    await update();
  }, [update]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isUnauthenticated,
    login,
    logout,
    refresh,
  };
}

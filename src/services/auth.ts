import { signIn, signOut } from 'next-auth/react';

export interface SignInCredentials {
  phone?: string;
  email?: string;
  code: string;
}

export interface SignInResult {
  success: boolean;
  error?: string;
  url?: string;
}

/**
 * 认证服务
 */
export const authService = {
  /**
   * 使用凭证登录（手机号/邮箱 + 验证码）
   */
  signInWithCredentials: async (credentials: SignInCredentials): Promise<SignInResult> => {
    try {
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        url: result?.url || '/dashboard/home',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '登录失败',
      };
    }
  },

  /**
   * 退出登录
   */
  signOut: async (callbackUrl: string = '/'): Promise<{ url: string }> => {
    const result = await signOut({ redirect: false, callbackUrl });
    return { url: result.url };
  },

  /**
   * 微信扫码登录
   */
  signInWithWeChat: async (): Promise<void> => {
    await signIn('wechat', { callbackUrl: '/dashboard/home' });
  },
};

export default authService;

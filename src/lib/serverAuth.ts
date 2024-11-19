// serverAuth.ts
import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';
import { authorizeUser } from '@/auth';

interface AuthResult {
  user: any;
  token: string;
}

export async function authenticateCredentials(
  providerId: string,
  credentials: Record<string, any>
): Promise<AuthResult> {
  try {
    console.log('1. authenticateCredentials called with:', {
      providerId,
      credentials: {
        ...credentials,
        code: '[REDACTED]',
      },
    });

    // 清理 credentials
    const cleanedCredentials = {
      type: credentials.type,
      identifier: credentials.identifier,
      code: credentials.code,
    };

    // 直接使用导出的 authorizeUser 函数
    console.log('2. Calling authorize function');
    const user = await authorizeUser(cleanedCredentials);
    console.log('3. Authorization result:', user);

    if (!user) {
      console.log('4. No user returned from authorize');
      throw new Error('Authentication failed: Invalid credentials');
    }

    console.log('5. Creating token');
    const token = {
      name: user.name,
      email: user.email,
      sub: user.id,
      phone: user.phone,
      wechatOpenId: user.wechatOpenId,
      nickName: user.nickName,
    };

    const encodedToken = await encode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
      salt: process.env.NEXTAUTH_SECRET!,
    });

    return { user, token: encodedToken };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

// 创建设置认证cookie的函数
export function setAuthCookies(token: string) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  };

  const cookieStore = cookies();

  // 根据环境设置合适的cookie名称
  const cookieName = process.env.NEXTAUTH_URL?.startsWith('https://')
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  cookieStore.set(cookieName, token, cookieOptions);
}

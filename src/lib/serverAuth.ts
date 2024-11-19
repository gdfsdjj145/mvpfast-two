import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';
import { authOptions } from '@/auth';

interface AuthResult {
  user: any;
  token: string;
}

export async function authenticateCredentials(
  providerId: string,
  credentials: Record<string, any>
): Promise<AuthResult> {
  // 获取指定的provider
  const provider = authOptions.providers.find((p) => p.id === providerId);

  if (!provider || !('authorize' in provider)) {
    throw new Error(`Provider ${providerId} not found or invalid`);
  }

  console.log(provider, 'provider===================');

  // 调用provider的authorize方法
  const user = await provider.authorize(credentials, null);

  if (!user) {
    throw new Error('Authentication failed');
  }

  // 创建token
  const token = {
    name: user.name,
    email: user.email,
    picture: user.image,
    sub: user.id,
    ...user,
  };

  // 编码token
  const encodedToken = await encode({
    token,
    secret: process.env.NEXTAUTH_SECRET!,
    salt: process.env.NEXTAUTH_SECRET!,
  });

  return { user, token: encodedToken };
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

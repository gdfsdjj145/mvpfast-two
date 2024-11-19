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
  try {
    console.log('1. authenticateCredentials called with:', {
      providerId,
      credentials: { ...credentials, code: '[REDACTED]' },
    });

    // 检查 authOptions 是否正确加载
    console.log(
      '2. authOptions providers:',
      authOptions.providers.map((p) => p.id)
    );

    const provider = authOptions.providers.find((p) => p.id === providerId);

    console.log('3. Found provider:', provider ? provider.id : 'not found');

    if (!provider || !('authorize' in provider)) {
      console.log('4. Provider validation failed');
      throw new Error(`Provider ${providerId} not found or invalid`);
    }

    console.log('5. Calling provider.authorize');
    const user = await provider.authorize(credentials, null);
    console.log('6. authorize result:', user);

    if (!user) {
      console.log('7. No user returned from authorize');
      throw new Error('Authentication failed: Invalid credentials');
    }

    // 创建token
    const token = {
      name: user.name,
      email: user.email,
      picture: user.image,
      sub: user.id,
      phone: user.phone,
      wechatOpenId: user.wechatOpenId,
      nickName: user.nickName,
      ...user,
    };

    console.log('8. Creating token');
    const encodedToken = await encode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
      salt: process.env.NEXTAUTH_SECRET!,
    });

    return { user, token: encodedToken };
  } catch (error) {
    console.error('Authentication error in authenticateCredentials:', error);
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

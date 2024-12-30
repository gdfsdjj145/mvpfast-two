import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { type DefaultSession } from 'next-auth';
import { getGeneratorName } from '@/lib/generatorName';
import { supabase } from './lib/supabase';

import prisma from './lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      phone?: string | null;
      role?: string;
      wechatOpenId?: string | null;
      nickName?: string | null;
      avatar?: string | null;
      // 其他需要的属性
      githubId?: string | null;
      googleId?: string | null;
    };
  }

  interface User {
    phone?: string;
    wechatOpenId?: string;
    role?: string;
    nickName?: string;
    avatar?: string;
    // 其他需要的属性
    id: string;
    email?: string | null;
    githubId?: string | null;
    googleId?: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: 'supabase',
      name: 'Supabase',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.token) return null;

        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email: credentials.email,
            token: credentials.token,
            type: 'email',
          });

          if (error || !data.user) return null;

          // 检查用户是否存在于 Prisma 数据库
          let user = await prisma.user.findFirst({
            where: { email: data.user.email },
          });

          // 如果用户不存在,则创建新用户
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: data.user.email,
                nickName: getGeneratorName(),
                createdDate: new Date(),
              },
            });
          }

          return user;
        } catch (error) {
          return null;
        }
      },
    },
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2小时
    updateAge: 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async session({ token, session }) {
      if (session.user) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub as string },
        });
        if (user) {
          session.user = { ...session.user, ...user };
        }
      }
      return session;
    },
  },
});

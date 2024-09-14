import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { type DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyCode } from './app/auth/signin/actions';
import { getGeneratorName } from '@/lib/generatorName';

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
      // 其他需要的属性
    };
  }

  interface User {
    phone?: string;
    wechatOpenId?: string;
    role?: string;
    nickName?: string;
    // 其他需要的属性
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const { identifier, code, type } = credentials;

        console.log('credentials', credentials);

        const verifyState = await verifyCode(type as string, {
          identifier,
          code,
        });

        if (verifyState || type === 'wx') {
          let res = null;
          const params = {
            email: null,
            wechatOpenId: null,
            phone: null,
            nickName: '',
            createdDate: new Date(),
          };
          if (type === 'email') {
            res = await prisma.user.findFirst({
              where: {
                email: identifier as string,
              },
            });
            params.email = identifier as string;
          }
          if (type === 'phone') {
            res = await prisma.user.findFirst({
              where: {
                phone: identifier as string,
              },
            });
            params.phone = identifier as string;
          }
          if (type === 'wx') {
            res = await prisma.user.findFirst({
              where: {
                wechatOpenId: identifier as string,
              },
            });
            params.wechatOpenId = identifier as string;
          }
          console.log(params, 'params');
          if (res) {
            return res;
          } else {
            params.nickName = getGeneratorName();
            await prisma.user.create({
              data: params,
            });
            return params;
          }
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
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
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.email) {
          session.user.email = token.email;
        }

        if (token.phone) {
          session.user.phone = token.phone as string;
        }

        if (token.wechatOpenId) {
          session.user.wechatOpenId = token.wechatOpenId as string;
          session.user.nickName = token.nickName as string;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.phone = user.phone;
        token.wechatOpenId = user.wechatOpenId;
        token.nickName = user.nickName;
      }
      return token;
    },
  },
});

import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { type DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyCode } from './app/auth/signin/actions';

import prisma from './app/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      phone?: string | null;
      role?: string;
      wechatOpenId?: string | null;
      // 其他需要的属性
    };
  }

  interface User {
    phone?: string;
    wechatOpenId?: string;
    role?: string;
    // 其他需要的属性
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const { identifier, code, type } = credentials;

        const verifyState = await verifyCode(type as string, {
          identifier,
          code,
        });

        if (verifyState || type === 'wx') {
          let res = null;
          const params = {
            email: '',
            wechatOpenId: '',
            phone: '',
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
          if (res) {
            return res;
          } else {
            await prisma.user.create({
              data: params,
            });
            return params;
          }
        }
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2小时
    updateAge: 60 * 60,
  },
  pages: {
    signIn: '/signin',
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

        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.phone = user.phone;
      }
      return token;
    },
  },
});

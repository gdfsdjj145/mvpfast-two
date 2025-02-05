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
      avatar?: string | null;
      // 其他需要的属性
    };
  }

  interface User {
    phone?: string;
    wechatOpenId?: string;
    role?: string;
    nickName?: string;
    avatar?: string;
    // 其他需要的属性
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
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
          if (res) {
            return res;
          } else {
            params.nickName = getGeneratorName();
            const newUser = await prisma.user.create({
              data: params,
            });
            return newUser;
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
        const user = await prisma.user.findUnique({
          where: { id: token.sub as string },
        });

        if (user) {
          session.user.id = user.id;
          session.user.email = user.email;
          session.user.phone = user.phone;
          session.user.wechatOpenId = user.wechatOpenId;
          session.user.avatar = user.avatar;
          session.user.nickName = user.nickName;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.phone = user.phone;
        token.wechatOpenId = user.wechatOpenId;
        token.nickName = user.nickName;
        token.avatar = user.avatar;
      } else {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
        });
        if (dbUser) {
          token.email = dbUser.email;
          token.phone = dbUser.phone;
          token.wechatOpenId = dbUser.wechatOpenId;
          token.nickName = dbUser.nickName;
          token.avatar = dbUser.avatar;
        }
      }
      return token;
    },
  },
});

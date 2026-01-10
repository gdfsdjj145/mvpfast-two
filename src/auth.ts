import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyCode } from './app/[local]/auth/signin/actions';
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
      wechatUnionId?: string | null;
      nickName?: string | null;
      avatar?: string | null;
    };
  }

  interface User {
    phone?: string | null;
    wechatOpenId?: string | null;
    wechatUnionId?: string | null;
    role?: string;
    nickName?: string | null;
    avatar?: string | null;
  }
}

interface UserParams {
  email: string | null;
  wechatOpenId: string | null;
  phone: string | null;
  nickName: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      async authorize(credentials): Promise<{
        id: string;
        email: string | null;
        phone: string | null;
        wechatOpenId: string | null;
        nickName: string | null;
        avatar: string | null;
      } | null> {
        const { identifier, code, type } = credentials as {
          identifier: string;
          code: string;
          type: string;
        };

        console.log('credentials', credentials);

        const verifyState = await verifyCode(type, {
          identifier,
          code,
        });

        if (type === 'wx') {
          const res = await prisma.user.findFirst({
            where: {
              wechatOpenId: identifier,
            },
          });
          if (res) {
            return res;
          }
        } else {
          if (verifyState) {
            let res = null;
            const params: UserParams = {
              email: null,
              wechatOpenId: null,
              phone: null,
              nickName: ''
            };
            if (type === 'email') {
              res = await prisma.user.findFirst({
                where: {
                  email: identifier,
                },
              });
              params.email = identifier;
            }
            if (type === 'phone') {
              res = await prisma.user.findFirst({
                where: {
                  phone: identifier,
                },
              });
              params.phone = identifier;
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
        }
        return null;
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (session.user as any).id = user.id;
          (session.user as any).email = user.email;
          (session.user as any).phone = user.phone;
          (session.user as any).wechatOpenId = user.wechatOpenId;
          (session.user as any).wechatUnionId = user.wechatUnionId;
          (session.user as any).avatar = user.avatar;
          (session.user as any).nickName = user.nickName;
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
        token.wechatUnionId = user.wechatUnionId;
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
          token.wechatUnionId = dbUser.wechatUnionId;
          token.nickName = dbUser.nickName;
          token.avatar = dbUser.avatar;
        }
      }
      return token;
    },
  },
});

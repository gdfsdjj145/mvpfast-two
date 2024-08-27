import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { type DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyCode } from './app/auth/signin/actions';

import prisma from './app/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: any;
      role: any;
    } & DefaultSession['user'];
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

        if (verifyState) {
          if (type === 'email') {
            const res = await prisma.user.findFirst({
              where: {
                email: identifier as string,
              },
            });
            if (res) {
              return res;
            } else {
              const user = await prisma.user.create({
                data: {
                  email: identifier as string,
                  wechatOpenId: '',
                  phone: '',
                  nickName: '',
                  createdDate: new Date(),
                },
              });
              return user;
            }
          }
        } else {
          return null;
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
          session.user.role = token.role;
        }

        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },
});

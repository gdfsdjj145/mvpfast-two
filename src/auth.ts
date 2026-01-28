import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyCode, verifyPasswordLogin } from './app/(main)/[local]/auth/signin/actions';
import { getGeneratorName } from '@/lib/generatorName';
import { grantInitialCredits } from '@/models/credit';

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
        const { identifier, code, type, password } = credentials as {
          identifier: string;
          code: string;
          type: string;
          password?: string;
        };

        console.log('credentials', credentials);

        // 账号密码登录
        if (type === 'password') {
          // 判断是邮箱还是手机号
          const identifierType = identifier.includes('@') ? 'email' : 'phone';
          const result = await verifyPasswordLogin({
            identifier,
            password: password || '',
            identifierType,
          });

          if (result.success && result.user) {
            return result.user;
          }
          return null;
        }

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
            if (type === 'email') {
              res = await prisma.user.findFirst({
                where: {
                  email: identifier,
                },
              });
              if (!res) {
                // 使用 upsert 避免唯一约束冲突
                res = await prisma.user.upsert({
                  where: {
                    wechatOpenId_phone_email: {
                      wechatOpenId: '',
                      phone: '',
                      email: identifier,
                    },
                  },
                  update: {},
                  create: {
                    email: identifier,
                    wechatOpenId: null,
                    phone: null,
                    nickName: getGeneratorName(),
                  },
                });
                // 新用户注册，赠送初始积分
                await grantInitialCredits(res.id);
              }
            }
            // dev 模式和 phone 模式都使用手机号登录
            if (type === 'phone' || type === 'dev') {
              res = await prisma.user.findFirst({
                where: {
                  phone: identifier,
                },
              });
              console.log('[Auth] Phone login - findFirst result:', res ? `Found user ${res.id}` : 'User not found');
              if (!res) {
                console.log('[Auth] Creating new user for phone:', identifier);
                // 使用 upsert 避免唯一约束冲突
                res = await prisma.user.upsert({
                  where: {
                    wechatOpenId_phone_email: {
                      wechatOpenId: '',
                      phone: identifier,
                      email: '',
                    },
                  },
                  update: {},
                  create: {
                    phone: identifier,
                    wechatOpenId: null,
                    email: null,
                    nickName: getGeneratorName(),
                  },
                });
                // 新用户注册，赠送初始积分
                await grantInitialCredits(res.id);
              }
            }
            if (res) {
              return res;
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
          (session.user as any).role = user.role;
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
        token.role = user.role;
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
          token.role = dbUser.role;
        }
      }
      return token;
    },
  },
});

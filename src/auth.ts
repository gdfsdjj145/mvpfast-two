import NextAuth from 'next-auth';
import type { DefaultSession, Session, NextAuthConfig, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
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
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    phone?: string | null;
    wechatOpenId?: string | null;
    role?: string | null;
    nickName?: string | null;
  }
}

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Identifier', type: 'text' },
        code: { label: 'Code', type: 'text' },
        type: { label: 'Type', type: 'text' },
      },
      async authorize(credentials: any) {
        try {
          if (!credentials) {
            console.log('No credentials provided');
            return null;
          }

          const { identifier, code, type } = credentials;
          console.log('A. Authorize function called with:', {
            type,
            identifier,
            code: code ? '[REDACTED]' : undefined,
          });

          // 微信登录特殊处理
          if (type === 'wx') {
            console.log('B. Processing WeChat login');
            const user = await prisma.user.findFirst({
              where: {
                wechatOpenId: identifier,
              },
            });

            if (user) {
              console.log('C. Existing WeChat user found');
              return user;
            }

            console.log('D. Creating new WeChat user');
            // 创建新用户
            const newUser = await prisma.user.create({
              data: {
                wechatOpenId: identifier,
                nickName: getGeneratorName(),
                createdDate: new Date(),
              },
            });

            console.log('E. New WeChat user created:', newUser);
            return newUser;
          }

          // 其他登录类型需要验证码
          console.log('F. Verifying code for type:', type);
          const verifyState = await verifyCode(type, { identifier, code });

          if (!verifyState) {
            console.log('G. Code verification failed');
            return null;
          }

          // 根据登录类型查找或创建用户
          let user;
          if (type === 'email') {
            user = await prisma.user.findFirst({
              where: { email: identifier },
            });
            if (!user) {
              user = await prisma.user.create({
                data: {
                  email: identifier,
                  nickName: getGeneratorName(),
                  createdDate: new Date(),
                },
              });
            }
          } else if (type === 'phone') {
            user = await prisma.user.findFirst({
              where: { phone: identifier },
            });
            if (!user) {
              user = await prisma.user.create({
                data: {
                  phone: identifier,
                  nickName: getGeneratorName(),
                  createdDate: new Date(),
                },
              });
            }
          }

          console.log('H. User result:', user);
          return user || null;
        } catch (error) {
          console.error('Error in authorize:', error);
          return null;
        }
      },
    }),
  ],
  // ... 其他配置保持不变
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);

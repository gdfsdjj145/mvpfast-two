import type { NextAuthConfig } from 'next-auth';

/**
 * Edge 兼容的 Auth.js 配置
 * 不包含 Prisma adapter 和数据库操作，可在 middleware (Edge Runtime) 中使用
 */
const authConfig: NextAuthConfig = {
  providers: [],  // providers 在 auth.ts 中完整定义
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2小时
    updateAge: 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    // 在 Edge middleware 中解析 JWT 时，将 token 字段映射到 session
    async session({ token, session }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

export default authConfig;

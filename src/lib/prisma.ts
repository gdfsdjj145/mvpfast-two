import { PrismaClient } from '@prisma/client';
import { config } from '../config';

let prisma: PrismaClient | null = null;

if (config.db) {
  // 根据 config.db 值决定是否初始化 Prisma
  prisma = new PrismaClient();
}

const prismaProxy = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    if (!prisma) {
      return () => Promise.resolve(null);
    }
    return (prisma as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export default prismaProxy as PrismaClient;

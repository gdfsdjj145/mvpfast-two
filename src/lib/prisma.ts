import { PrismaClient } from '@prisma/client';
import { config } from '../config'; //

let prisma: PrismaClient | null = null;

if (config.db) {
  // 根据 config.db 值决定是否初始化 Prisma
  prisma = new PrismaClient();
}

const prismaProxy = new Proxy(prisma, {
  get(target, prop) {
    if (!prisma) {
      return () => Promise.resolve(null);
    }
    return prisma[prop];
  },
});

export default prismaProxy as PrismaClient;

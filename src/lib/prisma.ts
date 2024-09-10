import { PrismaClient } from '@prisma/client';
import { config } from '../config'; //

let prisma: PrismaClient | null = null;

if (config.db) {
  // 根据 config.db 值决定是否初始化 Prisma
  prisma = new PrismaClient();
}

export default prisma;

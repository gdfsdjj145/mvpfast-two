import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type ConfigAuditLog = {
  id: string;
  created_time: Date;
  configKey: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedByEmail?: string | null;
  action: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type ConfigAuditLogCreateInput = {
  configKey: string;
  oldValue?: any;
  newValue: any;
  changedBy: string;
  changedByEmail?: string;
  action: 'create' | 'update' | 'delete';
  ipAddress?: string;
  userAgent?: string;
};

// 创建审计日志
export async function createAuditLog(data: ConfigAuditLogCreateInput) {
  return prisma.configAuditLog.create({
    data: {
      configKey: data.configKey,
      oldValue: data.oldValue,
      newValue: data.newValue,
      changedBy: data.changedBy,
      changedByEmail: data.changedByEmail,
      action: data.action,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
}

// 获取配置的审计日志
export async function getAuditLogsByKey(
  configKey: string,
  params: {
    skip?: number;
    take?: number;
  } = {}
) {
  const { skip = 0, take = 10 } = params;

  const [items, count] = await Promise.all([
    prisma.configAuditLog.findMany({
      where: { configKey },
      skip,
      take,
      orderBy: { created_time: 'desc' },
    }),
    prisma.configAuditLog.count({ where: { configKey } }),
  ]);

  return {
    items,
    count,
  };
}

// 获取最近的审计日志
export async function getRecentAuditLogs(params: {
  skip?: number;
  take?: number;
  userId?: string;
}) {
  const { skip = 0, take = 20, userId } = params;

  const where: Prisma.ConfigAuditLogWhereInput = userId
    ? { changedBy: userId }
    : {};

  const [items, count] = await Promise.all([
    prisma.configAuditLog.findMany({
      where,
      skip,
      take,
      orderBy: { created_time: 'desc' },
    }),
    prisma.configAuditLog.count({ where }),
  ]);

  return {
    items,
    count,
  };
}

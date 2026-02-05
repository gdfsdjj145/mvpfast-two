import prisma from '@/lib/core/prisma';
import { Prisma } from '@prisma/client';

export type SystemConfig = {
  id: string;
  created_time: Date;
  updated_time: Date;
  key: string;
  value: any;
  type: string;
  category: string;
  description?: string | null;
  isActive: boolean;
  updatedBy?: string | null;
};

export type SystemConfigCreateInput = {
  key: string;
  value: any;
  type: string;
  category: string;
  description?: string;
  isActive?: boolean;
  updatedBy?: string;
};

export type SystemConfigUpdateInput = Partial<
  Omit<SystemConfigCreateInput, 'key'>
>;

// 获取单个配置
export async function getConfigByKey(key: string) {
  return prisma.systemConfig.findUnique({
    where: { key, isActive: true },
  });
}

// 按分类获取配置
export async function getConfigsByCategory(category: string) {
  return prisma.systemConfig.findMany({
    where: { category, isActive: true },
    orderBy: { key: 'asc' },
  });
}

// 获取配置列表（分页）
export async function getConfigs(params: {
  skip?: number;
  take?: number;
  category?: string;
  search?: string;
}) {
  const { skip = 0, take = 10, category, search } = params;

  const where: Prisma.SystemConfigWhereInput = {
    isActive: true,
    ...(category && { category }),
    ...(search && {
      OR: [
        { key: { contains: search } },
        { description: { contains: search } },
      ],
    }),
  };

  const [items, count] = await Promise.all([
    prisma.systemConfig.findMany({
      skip,
      take,
      where,
      orderBy: { updated_time: 'desc' },
    }),
    prisma.systemConfig.count({ where }),
  ]);

  return {
    items,
    count,
  };
}

// 创建或更新配置
export async function upsertConfig(
  data: SystemConfigCreateInput,
  userId?: string
) {
  const existingConfig = await prisma.systemConfig.findUnique({
    where: { key: data.key },
  });

  return prisma.systemConfig.upsert({
    where: { key: data.key },
    update: {
      value: data.value,
      type: data.type,
      category: data.category,
      description: data.description,
      isActive: data.isActive ?? true,
      updatedBy: userId,
      updated_time: new Date(),
    },
    create: {
      key: data.key,
      value: data.value,
      type: data.type,
      category: data.category,
      description: data.description,
      isActive: data.isActive ?? true,
      updatedBy: userId,
    },
  });
}

// 软删除配置
export async function deleteConfig(key: string, userId?: string) {
  return prisma.systemConfig.update({
    where: { key },
    data: {
      isActive: false,
      updatedBy: userId,
      updated_time: new Date(),
    },
  });
}

// 获取所有配置（作为对象）
export async function getAllConfigsAsObject() {
  const configs = await prisma.systemConfig.findMany({
    where: { isActive: true },
  });

  const configObject: Record<string, any> = {};
  configs.forEach((config) => {
    configObject[config.key] = config.value;
  });

  return configObject;
}

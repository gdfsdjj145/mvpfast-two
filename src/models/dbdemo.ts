import prisma from '@/lib/prisma';
import { DbUserDemo, Prisma } from '@prisma/client';

// 创建DbUserDemo记录
export async function createDbUserDemo(data: {
  nickName: string;
}) {
  return prisma.dbUserDemo.create({
    data: {
      ...data,
      created_time: new Date(),
    },
  });
}

// 根据ID获取DbUserDemo记录
export async function getDbUserDemoById(id: string) {
  return prisma.dbUserDemo.findUnique({
    where: { id },
  });
}

// 查询DbUserDemo记录列表
export async function findDbUserDemos(
  where: any = {}, 
  skip = 0, 
  take = 10,
  orderBy: { [key: string]: 'asc' | 'desc' } = { created_time: 'desc' }
) {
  return prisma.dbUserDemo.findMany({
    where,
    skip,
    take,
    orderBy,
  });
}

// 更新DbUserDemo记录
export async function updateDbUserDemo(
  id: string,
  data: Partial<Omit<DbUserDemo, 'id' | 'created_time'>>
) {
  return prisma.dbUserDemo.update({
    where: { id },
    data,
  });
}

// 删除DbUserDemo记录
export async function deleteDbUserDemo(id: string) {
  return prisma.dbUserDemo.delete({
    where: { id },
  });
}

// 获取DbUserDemo记录总数
export async function countDbUserDemos(where: any = {}) {
  return prisma.dbUserDemo.count({
    where,
  });
}

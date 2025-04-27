import prisma from '@/lib/prisma';
import { User } from '@prisma/client';

// 创建用户
export async function createUser(data: {
  nickName: string;
  email?: string;
  phone?: any;
  avatar?: any;
  wechatOpenId?: string;
}) {
  return prisma.user.create({
    data: {
      ...data,
      created_time: new Date(),
    },
  });
}

// 根据ID获取用户
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

// 根据条件查询用户
export async function findUsers(where: Partial<User>, skip = 0, take = 10) {
  return prisma.user.findMany({
    where,
    skip,
    take,
  });
}

// 更新用户信息
export async function updateUser(
  id: string,
  data: Partial<Omit<User, 'id' | 'created_time'>>
) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

// 删除用户
export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

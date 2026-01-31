import prisma from '@/lib/prisma';
import { User, Prisma } from '@prisma/client';
import { type Role, hasPermission } from '@/lib/rbac';

// 用户角色类型（从 RBAC 统一导入）
export type UserRole = Role;

// 创建用户
export async function createUser(data: {
  nickName: string;
  email?: string;
  phone?: any;
  avatar?: any;
  wechatOpenId?: string;
  role?: UserRole;
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

// 获取用户列表（支持分页、搜索、排序）
export async function getUserList(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  orderBy?: 'created_time' | 'credits' | 'totalSpent';
  order?: 'asc' | 'desc';
}) {
  const {
    page = 1,
    pageSize = 10,
    search,
    role,
    orderBy,
    order = 'desc',
  } = params;

  const skip = (page - 1) * pageSize;

  // 构建查询条件
  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { nickName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  if (role) {
    where.role = role;
  }

  // 构建排序条件，默认按创建时间倒序
  const sortField = orderBy || 'created_time';
  const sortOrder = order || 'desc';

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortField]: sortOrder },
      select: {
        id: true,
        nickName: true,
        email: true,
        phone: true,
        avatar: true,
        wechatOpenId: true,
        credits: true,
        totalSpent: true,
        role: true,
        created_time: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// 获取用户统计信息
export async function getUserStats() {
  const [total, admins, activeUsers, totalCredits] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.user.count({
      where: {
        created_time: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天内注册
        },
      },
    }),
    prisma.user.aggregate({
      _sum: { credits: true },
    }),
  ]);

  return {
    total,
    admins,
    activeUsers,
    totalCredits: totalCredits._sum.credits || 0,
  };
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

// 更新用户角色
export async function updateUserRole(id: string, role: UserRole) {
  return prisma.user.update({
    where: { id },
    data: { role },
  });
}

// 删除用户
export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

// 检查用户是否拥有指定角色的权限
export async function hasRole(userId: string, role: Role): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === role;
}

// 检查用户是否为管理员（hasRole 的便捷别名）
export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, 'admin');
}

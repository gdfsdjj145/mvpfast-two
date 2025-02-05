'use server';
import prisma from '@/lib/prisma';

export const getUser = async (page: number = 1, pageSize: number = 10) => {
  const skip = (page - 1) * pageSize;
  
  const [total, users] = await Promise.all([
    prisma.dbUserDemo.count(),
    prisma.dbUserDemo.findMany({
      skip,
      take: pageSize,
      orderBy: {
        createdDate: 'desc'  // 按 时间 降序排序，你可以根据需要修改排序字段
      }
    })
  ]);

  return {
    data: users,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};

export const addUser = async (data: any): Promise<any> => {
  try {
    const user = await prisma.dbUserDemo.create({
      data,
    });
    return {
      success: true,
      message: '添加用户成功',
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: '添加用户失败',
    };
  }
};

export const updateUser = async (userId: string, data: any) => {
  try {
    await prisma.dbUserDemo.update({
      where: { id: userId },
      data
    });
    return { success: true, message: '更新成功' };
  } catch (error) {
    console.error('更新用户时出错:', error);
    return { success: false, message: '更新失败' };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await prisma.dbUserDemo.delete({
      where: { id: userId }
    });
    return { success: true, message: '删除成功' };
  } catch (error) {
    console.error('删除用户时出错:', error);
    return { success: false, message: '删除失败' };
  }
};

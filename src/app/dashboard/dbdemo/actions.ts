'use server';
import prisma from '@/lib/prisma';

export const getUser = async () => {
  const user = await prisma.dbUserDemo.findMany();
  return user;
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

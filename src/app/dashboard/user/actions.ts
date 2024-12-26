'use server';
import prisma from '@/lib/prisma';

export const addUser = async (data: any) => {
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


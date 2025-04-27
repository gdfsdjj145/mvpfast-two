'use server';
import prisma from '@/lib/prisma';

export const updateUserInfo = async (userId: string, data: any) => {
  try {
    const { id, email, emailVerified, image, wechatOpenId, phone, ...updateData } = data;
    
    const user = await prisma.user.update({
      where: {
        id: userId
      },
      data: updateData,
    });

    return {
      code: 0,
      data: user,
      message: '更新用户信息成功',
    };
  } catch (error) {
    console.error('更新用户信息时出错:', error);
    return {
      code: 1,
      message: '更新用户信息失败',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};

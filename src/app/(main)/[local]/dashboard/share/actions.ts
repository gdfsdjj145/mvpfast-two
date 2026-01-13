'use server';
import prisma from '@/lib/prisma';

export const gerShareByUserId = async (userId: string) => {
  try {
    const promotions = await prisma.promotion.findMany({
      where: {
        purchaser: userId,
      },
      orderBy: {
        created_time: 'desc',
      },
    });
    return {
      code: 0,
      data: promotions,
      message: '获取分享数据成功',
    };
  } catch (error) {
    console.error('获取用户分享数据时出错:', error);
    throw new Error('获取分享数据失败');
  }
};

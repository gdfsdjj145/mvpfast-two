'use server';
import prisma from '@/lib/prisma';

export const createOrder = async (order: any) => {
  const newOrder = await prisma.order.create({
    data: order,
  });
  return newOrder;
};

export const checkUserPayment = async (userId: string) => {
  try {
    const existingOrder = await prisma.order.findFirst({
      where: {
        identifier: userId,
      },
    });
    console.log('existingOrder', existingOrder);
    return {
      code: 0,
      data: {
        hasPaid: !!existingOrder,
        transactionId: existingOrder?.transactionId,
        createdAt: existingOrder?.createdAt,
        orderId: existingOrder?.orderId,
        price: existingOrder?.price,
        name: existingOrder?.name,
        orderType: existingOrder?.orderType,
      },
      message: existingOrder ? '用户已支付' : '用户未支付',
    };
  } catch (error) {
    console.error('检查用户支付状态时出错:', error);
    return {
      code: 1,
      data: null,
      message: '检查支付状态失败',
    };
  }
};

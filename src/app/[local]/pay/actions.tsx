'use server';
import { createOrder as modelCreateOrder, getOrders } from '@/models/order';
import prisma from '@/lib/prisma';

// 创建已支付的订单
export const createOrder = async (order: any) => {
  const newOrder = await modelCreateOrder(order);
  if (order.promoter) {
    await prisma.promotion.create({
      data: {
        identifier: order.identifier,
        orderType: order.orderType,
        promotionPrice: order.promotionPrice,
        purchaser: order.promoter,
      },
    });
  }
  return newOrder;
};

// 创建待支付的订单，用于yungou支付
export const createPayOrder = async (order: any) => {
  const newOrder = await prisma.payOrder.create({
    data: order,
  });
  return newOrder;
};

// 检测yungou订单状态
export const checkYungouOrderStatus = async (identifier: string) => {
  const payOrder = await prisma.payOrder.findFirst({
    where: {
      identifier: identifier,
    },
  });
  return payOrder;
};

export const checkUserPayment = async (userId: string) => {
  try {
    const { items } = await getOrders({
      where: {
        identifier: userId
      },
      take: 1
    });
    
    const existingOrder = items[0];
    
    return {
      code: 0,
      data: {
        hasPaid: !!existingOrder,
        transactionId: existingOrder?.transactionId,
        created_time: existingOrder?.created_time,
        orderId: existingOrder?.orderId,
        price: existingOrder?.price,
        name: existingOrder?.name,
        orderType: existingOrder?.orderType,
        promoter: existingOrder?.promoter,
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

// 检测推广人是否存在
export const checkUserById = async (userId: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    return {
      code: 0,
      data: user,
      message: '',
    };
  } catch (error) {
    return {
      code: 1,
      data: null,
      message: '无此推广人',
    };
  }
};

'use server';
import prisma from '@/lib/prisma';

export const getOrdersByUserId = async (userId: string) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        identifier: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, data: orders };
  } catch (error) {
    console.error('获取订单失败:', error);
    return { success: false, data: [] };
  }
};

export const createMockOrder = async (userId: string, orderData: any) => {
  try {
    const order = await prisma.order.create({
      data: {
        identifier: userId,
        orderId: `ORDER${Date.now()}`,
        transactionId: `TRANS${Date.now()}`,
        orderType: orderData.type,
        price: orderData.price,
        name: orderData.name,
        createdAt: new Date(),
      },
    });
    return { success: true, data: order };
  } catch (error) {
    console.error('创建订单失败:', error);
    return { success: false };
  }
};

export const deleteOrder = async (orderId: string) => {
  try {
    await prisma.order.delete({
      where: {
        id: orderId,
      },
    });
    return { success: true, message: '删除成功' };
  } catch (error) {
    console.error('删除订单失败:', error);
    return { success: false, message: '删除失败' };
  }
};
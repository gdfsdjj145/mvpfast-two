'use server';
import { createOrder, getOrders, deleteOrder as deleteOrderModel } from '@/models/order';

export const getOrdersByUserId = async (userId: string) => {
  try {
    const result = await getOrders({
      where: {
        identifier: userId,
      },
      orderBy: {
        created_time: 'desc',
      },
    });
    return { success: true, data: result.items };
  } catch (error) {
    console.error('获取订单失败:', error);
    return { success: false, data: [] };
  }
};

export const createMockOrder = async (userId: string, orderData: any) => {
  try {
    const orderInput = {
      identifier: userId,
      orderId: `ORDER${Date.now()}`,
      transactionId: `TRANS${Date.now()}`,
      orderType: orderData.type,
      price: orderData.price,
      name: orderData.name,
      promotionPrice: 0,
      created_time: new Date(),
    };
    
    const order = await createOrder(orderInput);
    return { success: true, data: order };
  } catch (error) {
    console.error('创建订单失败:', error);
    return { success: false };
  }
};

export const deleteOrder = async (orderId: string) => {
  try {
    await deleteOrderModel({
      id: orderId,
    });
    return { success: true, message: '删除成功' };
  } catch (error) {
    console.error('删除订单失败:', error);
    return { success: false, message: '删除失败' };
  }
};
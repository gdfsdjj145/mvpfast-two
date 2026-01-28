'use server';
import { createOrder as modelCreateOrder, getOrders } from '@/models/order';
import { rechargeCredits, consumeCredits, getUserCredits, hasEnoughCredits } from '@/models/credit';
import prisma from '@/lib/prisma';

// 创建已支付的订单
export const createOrder = async (order: any) => {
  const newOrder = await modelCreateOrder(order);

  // 如果是积分充值订单，执行充值逻辑
  if (order.orderType === 'credit' && order.creditAmount) {
    try {
      await rechargeCredits({
        userId: order.identifier,
        amount: order.creditAmount,
        orderId: order.orderId,
        description: `充值 ${order.creditAmount} 积分`
      });
      console.log(`[积分充值成功] 用户: ${order.identifier}, 积分: ${order.creditAmount}`);
    } catch (error) {
      console.error('[积分充值失败]', error);
      // 充值失败但订单已创建，需要人工处理或记录日志
      throw error;
    }
  }

  // 处理推广
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

export const checkUserPayment = async (userId: string, orderType?: string) => {
  try {
    const where: any = { identifier: userId };

    // 如果指定了订单类型且不是积分充值，则只查询该类型
    if (orderType && orderType !== 'credit') {
      where.orderType = orderType;
    }

    // 积分充值可以多次购买，商品购买只查最新一条
    const take = orderType === 'credit' ? 10 : 1;

    const { items } = await getOrders({
      where,
      take,
      orderBy: { created_time: 'desc' }
    });

    const existingOrder = items[0];

    return {
      code: 0,
      data: {
        hasPaid: !!existingOrder,
        canPurchaseAgain: orderType === 'credit', // 积分充值可重复购买
        orders: items, // 返回所有订单（用于积分充值历史）
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

// ============================================
// 积分购买模式相关函数
// ============================================

// 获取用户积分信息
export const getUserCreditsInfo = async (userId: string) => {
  try {
    const credits = await getUserCredits(userId);
    return {
      code: 0,
      data: { credits },
      message: '',
    };
  } catch (error) {
    console.error('获取用户积分失败:', error);
    return {
      code: 1,
      data: { credits: 0 },
      message: '获取积分失败',
    };
  }
};

// 使用积分购买商品
export const purchaseWithCredits = async (params: {
  userId: string;
  productKey: string;
  productName: string;
  creditAmount: number;
  promoter?: string;
  promotionCredits?: number;
}) => {
  const { userId, productKey, productName, creditAmount, promoter, promotionCredits = 0 } = params;

  try {
    // 1. 检查积分是否足够
    const hasEnough = await hasEnoughCredits(userId, creditAmount);
    if (!hasEnough) {
      const currentCredits = await getUserCredits(userId);
      return {
        code: 1,
        data: null,
        message: `积分不足，当前余额: ${currentCredits}，需要: ${creditAmount}`,
      };
    }

    // 2. 生成订单号
    const orderId = `CREDIT_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 3. 扣除积分（使用事务）
    await consumeCredits({
      userId,
      amount: creditAmount,
      description: `购买商品: ${productName}`,
      metadata: {
        orderId,
        productKey,
        productName,
      },
    });

    // 4. 创建订单记录
    const order = await modelCreateOrder({
      identifier: userId,
      transactionId: `CREDITS_${orderId}`, // 积分支付的交易ID
      orderId,
      orderType: productKey,
      price: 0, // 积分购买不涉及现金
      name: productName,
      promoter: promoter || null,
      promotionPrice: promotionCredits,
      creditAmount: creditAmount, // 记录消费的积分数
    });

    // 5. 处理推广记录
    if (promoter) {
      await prisma.promotion.create({
        data: {
          identifier: userId,
          orderType: productKey,
          promotionPrice: promotionCredits,
          purchaser: promoter,
        },
      });
    }

    return {
      code: 0,
      data: {
        orderId,
        creditAmount,
        productKey,
        productName,
        remainingCredits: await getUserCredits(userId),
      },
      message: '购买成功',
    };
  } catch (error: any) {
    console.error('积分购买失败:', error);
    return {
      code: 1,
      data: null,
      message: error.message || '购买失败，请稍后重试',
    };
  }
};

// 检查用户是否有足够积分购买商品
export const checkCreditsForPurchase = async (userId: string, creditAmount: number) => {
  try {
    const currentCredits = await getUserCredits(userId);
    const hasEnough = currentCredits >= creditAmount;

    return {
      code: 0,
      data: {
        currentCredits,
        requiredCredits: creditAmount,
        hasEnough,
        shortfall: hasEnough ? 0 : creditAmount - currentCredits,
      },
      message: hasEnough ? '积分充足' : '积分不足',
    };
  } catch (error) {
    console.error('检查积分失败:', error);
    return {
      code: 1,
      data: null,
      message: '检查积分失败',
    };
  }
};

'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { getUserCreditInfo, getCreditTransactions } from '@/models/credit';
import { unstable_noStore as noStore } from 'next/cache';

// 获取用户仪表盘数据
export const getUserDashboardData = async (days: number = 7) => {
  noStore(); // 禁用缓存，确保每次获取最新数据

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        credits: 0,
        totalSpent: 0,
        totalRecharge: 0,
        totalConsume: 0,
        recentTransactions: [],
        dailyData: { labels: [], recharge: [], consume: [] },
      };
    }

    const userId = session.user.id;

    // 获取用户积分信息
    const creditInfo = await getUserCreditInfo(userId);

    // 获取指定时间范围内的交易记录
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const rangeTransactions = await prisma.creditTransaction.findMany({
      where: {
        userId,
        created_time: { gte: startDate },
      },
      orderBy: { created_time: 'desc' },
    });

    // 计算时间范围内的总充值和总消费
    let totalRecharge = 0;
    let totalConsume = 0;

    rangeTransactions.forEach((tx) => {
      if (tx.type === 'recharge' && tx.amount > 0) {
        totalRecharge += tx.amount;
      } else if (tx.type === 'consume' || tx.amount < 0) {
        totalConsume += tx.amount; // 负数
      }
    });

    // 获取最近10条交易记录
    const recentTransactions = rangeTransactions.slice(0, 10).map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      balance: tx.balance,
      description: tx.description,
      created_time: tx.created_time.toISOString(),
    }));

    // 获取指定天数的数据
    const dailyData = await getDailyTransactionData(userId, days);

    return {
      credits: creditInfo?.credits ?? 0,
      totalSpent: creditInfo?.totalSpent ?? 0,
      totalRecharge,
      totalConsume,
      recentTransactions,
      dailyData,
    };
  } catch (error) {
    console.error('获取用户仪表盘数据失败:', error);
    return {
      credits: 0,
      totalSpent: 0,
      totalRecharge: 0,
      totalConsume: 0,
      recentTransactions: [],
      dailyData: { labels: [], recharge: [], consume: [] },
    };
  }
};

// 获取指定天数的每日交易数据
async function getDailyTransactionData(userId: string, days: number = 7) {
  const labels: string[] = [];
  const rechargeData: number[] = [];
  const consumeData: number[] = [];

  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    // 日期标签
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`);

    // 查询当天的充值和消费
    const dayTransactions = await prisma.creditTransaction.findMany({
      where: {
        userId,
        created_time: {
          gte: date,
          lt: nextDate,
        },
      },
    });

    let dayRecharge = 0;
    let dayConsume = 0;

    dayTransactions.forEach((tx) => {
      if (tx.type === 'recharge' && tx.amount > 0) {
        dayRecharge += tx.amount;
      } else if (tx.type === 'consume' || tx.amount < 0) {
        dayConsume += Math.abs(tx.amount);
      }
    });

    rechargeData.push(dayRecharge);
    consumeData.push(dayConsume);
  }

  return {
    labels,
    recharge: rechargeData,
    consume: consumeData,
  };
}

// 保留旧的函数以兼容其他地方的调用
export const getDashboardStats = async () => {
  try {
    const [totalUsers, totalOrders] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
    ]);

    return {
      totalUsers,
      totalOrders,
      userGrowthData: { labels: [], datasets: [{ label: '用户增长', data: [] }] },
      orderTrendData: { labels: [], datasets: [{ label: '每日订单', data: [] }] },
    };
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    return {
      totalUsers: 0,
      totalOrders: 0,
      userGrowthData: { labels: [], datasets: [{ label: '用户增长', data: [] }] },
      orderTrendData: { labels: [], datasets: [{ label: '每日订单', data: [] }] },
    };
  }
};

// 获取当前用户积分信息
export const getCurrentUserCredits = async () => {
  noStore(); // 禁用缓存

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const creditInfo = await getUserCreditInfo(session.user.id);

    return {
      credits: creditInfo?.credits ?? 0,
      totalSpent: creditInfo?.totalSpent ?? 0,
    };
  } catch (error) {
    console.error('获取用户积分信息失败:', error);
    return null;
  }
};

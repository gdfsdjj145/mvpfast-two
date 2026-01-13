'use server';

import { getOrders } from '@/models/order';
import prisma from '@/lib/prisma';

// 获取用户增长趋势数据（最近6个月）
async function getUserGrowthData() {
  // 获取当前日期
  const now = new Date();
  const months = [];
  const userCounts = [];
  
  // 获取过去6个月的月份名称和用户数据
  for (let i = 5; i >= 0; i--) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1);
    
    // 月份名称（中文）
    const monthName = `${targetMonth.getMonth() + 1}月`;
    months.push(monthName);
    
    // 查询该月创建的用户数量
    const userCount = await prisma.user.count({
      where: {
        created_time: {
          gte: targetMonth,
          lt: nextMonth
        }
      }
    });
    
    userCounts.push(userCount);
  }
  
  return {
    labels: months,
    datasets: [
      {
        label: '用户增长',
        data: userCounts,
      },
    ],
  };
}

// 获取一周订单数据
async function getWeeklyOrderData() {
  // 获取当前日期
  const now = new Date();
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const orderCounts = [];
  
  // 获取今天是星期几（0是周日，1是周一，...）
  const todayDay = now.getDay();
  
  // 计算本周一的日期
  const monday = new Date(now);
  monday.setDate(now.getDate() - (todayDay === 0 ? 6 : todayDay - 1));
  monday.setHours(0, 0, 0, 0);
  
  // 遍历本周的每一天
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);
    
    const nextDay = new Date(currentDay);
    nextDay.setDate(currentDay.getDate() + 1);
    
    // 查询当天的订单数量
    const orderCount = await prisma.order.count({
      where: {
        created_time: {
          gte: currentDay,
          lt: nextDay
        }
      }
    });
    
    orderCounts.push(orderCount);
  }
  
  return {
    labels: dayNames,
    datasets: [
      {
        label: '每日订单',
        data: orderCounts,
      },
    ],
  };
}

export const getDashboardStats = async () => {
  try {
    // 获取真实数据
    const [ordersData, totalUsers, userGrowthData, weeklyOrderData] = await Promise.all([
      getOrders({}),
      prisma.user.count(), // 直接使用prisma计数而不是findUsers
      getUserGrowthData(),
      getWeeklyOrderData()
    ]);

    const totalOrders = ordersData.count;

    // 其他保持Mock数据
    const mockData = {
      totalUsers,
      totalOrders,
      totalRevenue: 99999,
      totalViews: 56789,
      recentOrders: [
        {
          id: '1',
          orderId: 'ORD20240301001',
          userName: '张三',
          productName: '专业版',
          amount: 299,
          created_time: new Date('2024-03-01'),
        },
        {
          id: '2',
          orderId: 'ORD20240228001',
          userName: '李四',
          productName: '基础版',
          amount: 99,
          created_time: new Date('2024-02-28'),
        },
        {
          id: '3',
          orderId: 'ORD20240227001',
          userName: '王五',
          productName: '专业版',
          amount: 299,
          created_time: new Date('2024-02-27'),
        },
      ],
      // 使用真实数据替换模拟数据
      monthlyRevenue: [
        { month: '1月', revenue: 12000 },
        { month: '2月', revenue: 19000 },
        { month: '3月', revenue: 15000 },
        { month: '4月', revenue: 22000 },
        { month: '5月', revenue: 18000 },
        { month: '6月', revenue: 25000 },
        { month: '7月', revenue: 28000 },
        { month: '8月', revenue: 30000 },
        { month: '9月', revenue: 35000 },
        { month: '10月', revenue: 32000 },
        { month: '11月', revenue: 38000 },
        { month: '12月', revenue: 42000 },
      ],
      orderTypes: [
        { name: '基础版', count: 150 },
        { name: '专业版', count: 280 },
        { name: '企业版', count: 70 },
      ],
      // 添加真实用户增长和订单趋势数据
      userGrowthData,
      orderTrendData: weeklyOrderData,
    };

    return mockData;
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    return {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalViews: 0,
      recentOrders: [],
      monthlyRevenue: [],
      orderTypes: [],
      userGrowthData: { labels: [], datasets: [{ label: '用户增长', data: [] }] },
      orderTrendData: { labels: [], datasets: [{ label: '每日订单', data: [] }] },
    };
  }
};

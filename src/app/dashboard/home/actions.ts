'use server';

export const getDashboardStats = async () => {
  try {
    // Mock 数据
    const mockData = {
      totalUsers: 1234,
      totalOrders: 789,
      totalRevenue: 99999,
      totalViews: 56789,
      recentOrders: [
        {
          id: '1',
          orderId: 'ORD20240301001',
          userName: '张三',
          productName: '专业版',
          amount: 299,
          createdAt: new Date('2024-03-01'),
        },
        {
          id: '2',
          orderId: 'ORD20240228001',
          userName: '李四',
          productName: '基础版',
          amount: 99,
          createdAt: new Date('2024-02-28'),
        },
        {
          id: '3',
          orderId: 'ORD20240227001',
          userName: '王五',
          productName: '专业版',
          amount: 299,
          createdAt: new Date('2024-02-27'),
        },
      ],
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
    };
  }
};

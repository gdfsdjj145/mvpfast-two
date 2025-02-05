'use client';
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getDashboardStats } from './actions';
import { FiUsers, FiShoppingCart, FiDollarSign, FiEye } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

// 注册 ChartJS 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalViews: 0,
    recentOrders: [],
    monthlyRevenue: [],
    orderTypes: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getDashboardStats();
      setStats(data);
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: '总用户数',
      value: stats.totalUsers,
      icon: <FiUsers className="w-8 h-8" />,
      color: 'bg-blue-500',
    },
    {
      title: '总订单数',
      value: stats.totalOrders,
      icon: <FiShoppingCart className="w-8 h-8" />,
      color: 'bg-green-500',
    },
    {
      title: '总收入',
      value: `¥${stats.totalRevenue.toLocaleString()}`,
      icon: <FiDollarSign className="w-8 h-8" />,
      color: 'bg-yellow-500',
    },
    {
      title: '总浏览量',
      value: stats.totalViews.toLocaleString(),
      icon: <FiEye className="w-8 h-8" />,
      color: 'bg-purple-500',
    },
  ];

  const monthlyRevenueData = {
    labels: stats.monthlyRevenue.map((item: any) => item.month),
    datasets: [
      {
        label: '月收入',
        data: stats.monthlyRevenue.map((item: any) => item.revenue),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
      },
    ],
  };

  const orderTypesData = {
    labels: stats.orderTypes.map((item: any) => item.name),
    datasets: [
      {
        data: stats.orderTypes.map((item: any) => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 月收入趋势图 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">月收入趋势</h3>
          <Line
            data={monthlyRevenueData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        {/* 订单类型分布图 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">订单类型分布</h3>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut
              data={orderTypesData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* 最近订单 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">最近订单</h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>订单号</th>
                <th>用户</th>
                <th>商品</th>
                <th>金额</th>
                <th>时间</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id}>
                  <td>{order.orderId}</td>
                  <td>{order.userName}</td>
                  <td>{order.productName}</td>
                  <td>¥{order.amount}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    <span className="badge badge-success">已支付</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

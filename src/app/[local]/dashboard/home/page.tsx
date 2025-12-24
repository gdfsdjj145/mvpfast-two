'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
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
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { getDashboardStats } from './actions';
import { FiUsers, FiShoppingCart } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
  Filler
);

// 统计卡片组件
const StatCard = ({ title, value, icon, color, isLoading }: { title: string; value: string; icon: React.ReactNode; color: string; isLoading: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-base-100 rounded-xl shadow-md p-5 transition-all hover:shadow-lg border border-base-300/50"
    >
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-base-300 rounded w-3/4"></div>
          <div className="h-8 bg-base-300 rounded w-1/2"></div>
          <div className="absolute top-5 right-5 h-10 w-10 bg-base-300 rounded-lg"></div>
        </div>
      ) : (
        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-base-content/70 text-sm font-medium uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold mt-2 text-base-content">{value}</p>
          </div>
          <div className={`absolute top-0 right-0 ${color} p-3 rounded-lg text-white shadow-md`}>
            {icon}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// 图表卡片组件
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartCard = ({ title, ChartComponent, chartData, chartOptions, isLoading }: { title: string; ChartComponent: any; chartData: unknown; chartOptions: unknown; isLoading: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-base-100 rounded-xl shadow-md p-5 transition-all hover:shadow-lg border border-base-300/50"
    >
      <h3 className="text-lg font-semibold mb-4 text-base-content">{title}</h3>
      <div className="h-64 md:h-80">
        {isLoading ? (
          <div className="animate-pulse h-full flex items-center justify-center">
            <div className="w-full h-full bg-base-300 rounded"></div>
          </div>
        ) : (
          <ChartComponent data={chartData} options={chartOptions} />
        )}
      </div>
    </motion.div>
  );
};

// 创建蓝色渐变效果
const createBlueGradient = (ctx: CanvasRenderingContext2D | null, chartArea: { top: number; bottom: number } | undefined) => {
  if (!ctx || !chartArea) {
    return 'rgba(0,0,0,0.1)';
  }
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, 'rgba(65, 105, 225, 0.5)');  // 皇家蓝，半透明
  gradient.addColorStop(1, 'rgba(65, 105, 225, 0.05)'); // 皇家蓝，几乎透明
  return gradient;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalOrders: 0,
    userGrowthData: { labels: [], datasets: [] },
    orderTrendData: { labels: [], datasets: [] },
  });

  const createGradientCallback = useCallback(createBlueGradient, []);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // 获取真实数据
        const dashboardStats = await getDashboardStats();
        
        // 定义多彩的颜色值
        const vibrantColors = {
          blue: '#4169E1',       // 皇家蓝
          indigo: '#6610f2',     // 靛青色
          purple: '#6f42c1',     // 紫色
          pink: '#e83e8c',       // 粉色
          red: '#dc3545',        // 红色
          orange: '#fd7e14',     // 橙色
          yellow: '#ffc107',     // 黄色
          green: '#28a745',      // 绿色
          teal: '#20c997',       // 蓝绿色
          cyan: '#17a2b8',       // 青色
        };

        // 多彩图表背景色（带透明度）
        const vibrantBgColors = [
          'rgba(65, 105, 225, 0.7)',  // 蓝色
          'rgba(102, 16, 242, 0.7)',  // 靛青色
          'rgba(111, 66, 193, 0.7)',  // 紫色
          'rgba(232, 62, 140, 0.7)',  // 粉色
          'rgba(220, 53, 69, 0.7)',   // 红色
          'rgba(253, 126, 20, 0.7)',  // 橙色
          'rgba(255, 193, 7, 0.7)',   // 黄色
        ];

        // 边框颜色（不透明）
        const vibrantBorderColors = [
          'rgb(65, 105, 225)',   // 蓝色
          'rgb(102, 16, 242)',   // 靛青色
          'rgb(111, 66, 193)',   // 紫色
          'rgb(232, 62, 140)',   // 粉色
          'rgb(220, 53, 69)',    // 红色
          'rgb(253, 126, 20)',   // 橙色
          'rgb(255, 193, 7)',    // 黄色
        ];

        // 获取用户增长数据并应用样式
        const userGrowthData = {
          ...dashboardStats.userGrowthData,
          datasets: dashboardStats.userGrowthData.datasets.map(dataset => ({
            ...dataset,
            fill: true,
            borderColor: vibrantColors.blue,
            backgroundColor: (context: any) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              return createGradientCallback(ctx, chartArea);
            },
            tension: 0.3,
            pointBackgroundColor: vibrantColors.blue,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: vibrantColors.blue,
          }))
        };

        // 获取订单趋势数据并应用样式
        const orderTrendData = {
          ...dashboardStats.orderTrendData,
          datasets: dashboardStats.orderTrendData.datasets.map(dataset => ({
            ...dataset,
            backgroundColor: vibrantBgColors,
            borderColor: vibrantBorderColors,
            borderWidth: 1,
            borderRadius: 4,
          }))
        };

        // 合并真实数据和图表模拟数据
        setStats({
          totalUsers: dashboardStats.totalUsers,
          totalOrders: dashboardStats.totalOrders,
          userGrowthData: userGrowthData,
          orderTrendData: orderTrendData,
        });
      } catch (error) {
        console.error("获取仪表盘数据失败:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [createGradientCallback]);

  const statCards = [
    {
      title: '总用户数',
      value: isLoading ? '...' : stats.totalUsers.toLocaleString(),
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-primary',
    },
    {
      title: '总订单数',
      value: isLoading ? '...' : stats.totalOrders.toLocaleString(),
      icon: <FiShoppingCart className="w-6 h-6" />,
      color: 'bg-secondary',
    },
  ];

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        padding: 10,
        cornerRadius: 4,
        boxPadding: 5,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.7)',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.7)',
          font: {
            size: 12,
          },
          padding: 8,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} isLoading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="用户增长趋势"
          ChartComponent={Line} 
          chartData={stats.userGrowthData}
          chartOptions={commonChartOptions}
          isLoading={isLoading}
        />

        <ChartCard
          title="每日订单趋势"
          ChartComponent={Bar}
          chartData={stats.orderTrendData}
          chartOptions={commonChartOptions}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

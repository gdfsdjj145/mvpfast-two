'use client';
import React, { useEffect, useState, useRef } from 'react';
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
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { getUserDashboardData } from './actions';
import { motion } from 'framer-motion';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  History,
  Ticket,
  Gift,
  X,
  CheckCircle,
  Loader2,
  Sparkles,
  Calendar,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';
import { config } from '@/config';
import toast from 'react-hot-toast';
import { formatDateTimeShort } from '@/lib/utils/common';

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
  Filler,
  ArcElement
);

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  created_time: string;
}

interface DashboardData {
  credits: number;
  totalSpent: number;
  totalRecharge: number;
  totalConsume: number;
  recentTransactions: CreditTransaction[];
  dailyData: { labels: string[]; recharge: number[]; consume: number[] };
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [dateRange, setDateRange] = useState<7 | 30>(7);

  // 兑换码弹窗状态
  const [redeemCode, setRedeemCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{
    success: boolean;
    creditAmount?: number;
    newBalance?: number;
    message?: string;
  } | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  // 是否为积分模式
  const isCreditsMode = config.purchaseMode === 'credits';

  // 动画配置 - 提升到组件顶部
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    },
  };

  // 打开兑换弹窗
  const openRedeemModal = () => {
    setRedeemCode('');
    setRedeemResult(null);
    modalRef.current?.showModal();
  };

  // 关闭兑换弹窗
  const closeRedeemModal = async () => {
    const wasSuccess = redeemResult?.success;
    modalRef.current?.close();
    setRedeemCode('');
    setRedeemResult(null);

    // 如果兑换成功，关闭弹窗后再次刷新数据确保显示最新
    if (wasSuccess) {
      setIsLoading(true);
      try {
        const newData = await getUserDashboardData(dateRange);
        setData(newData);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 兑换积分
  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      toast.error('请输入兑换码');
      return;
    }

    setIsRedeeming(true);
    setRedeemResult(null);

    try {
      const res = await fetch('/api/user/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode.trim() }),
      });
      const result = await res.json();

      if (result.success) {
        setRedeemResult({
          success: true,
          creditAmount: result.data.creditAmount,
          newBalance: result.data.newBalance,
          message: result.message,
        });
        // 刷新仪表盘数据
        const newData = await getUserDashboardData(dateRange);
        setData(newData);
      } else {
        setRedeemResult({
          success: false,
          message: result.error || '兑换失败',
        });
      }
    } catch (error) {
      setRedeemResult({
        success: false,
        message: '网络错误，请稍后重试',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getUserDashboardData(dateRange);
        setData(result);
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);


  // 渲染类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recharge':
        return <TrendingUp size={16} className="text-success" />;
      case 'consume':
        return <TrendingDown size={16} className="text-error" />;
      case 'refund':
        return <ArrowRightLeft size={16} className="text-warning" />;
      default:
        return <Coins size={16} />;
    }
  };

  // 渲染类型文字
  const getTypeText = (type: string) => {
    switch (type) {
      case 'recharge':
        return '充值';
      case 'consume':
        return '消费';
      case 'refund':
        return '退款';
      default:
        return type;
    }
  };

  // 趋势图配置 - 现代化样式
  const trendChartData = {
    labels: data?.dailyData?.labels || [],
    datasets: [
      {
        label: '充值',
        data: data?.dailyData?.recharge || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#10b981',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
      {
        label: '消费',
        data: data?.dailyData?.consume || [],
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#f43f5e',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
  };

  // 分布图数据 - 现代化配色
  const distributionData = {
    labels: ['充值', '消费'],
    datasets: [
      {
        data: [data?.totalRecharge || 0, Math.abs(data?.totalConsume || 0)],
        backgroundColor: ['#10b981', '#f43f5e'],
        borderColor: ['#fff', '#fff'],
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  if (!isCreditsMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-base-content/60">
          <Wallet size={48} className="mx-auto mb-4 opacity-50" />
          <p>当前系统未启用积分模式</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 时间范围选择 - 更精致的设计 */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <div className="inline-flex items-center gap-1 p-1 bg-base-200/60 rounded-xl">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              dateRange === 7
                ? 'bg-white text-primary shadow-sm'
                : 'text-base-content/60 hover:text-base-content hover:bg-white/50'
            }`}
            onClick={() => setDateRange(7)}
          >
            <Calendar size={14} className="inline-block mr-1.5 -mt-0.5" />
            近7天
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              dateRange === 30
                ? 'bg-white text-primary shadow-sm'
                : 'text-base-content/60 hover:text-base-content hover:bg-white/50'
            }`}
            onClick={() => setDateRange(30)}
          >
            <Calendar size={14} className="inline-block mr-1.5 -mt-0.5" />
            近30天
          </button>
        </div>
      </motion.div>

      {/* 主要统计卡片 - 重新设计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 当前积分 - 主视觉卡片 */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-2 lg:col-span-1 relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-2xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
          <div className="relative p-6 text-white">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/30 rounded w-1/2" />
                <div className="h-12 bg-white/30 rounded w-3/4" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Coins size={22} className="text-white" />
                    </div>
                    <span className="text-white/90 font-medium">当前积分</span>
                  </div>
                  <Sparkles size={20} className="text-white/60" />
                </div>
                <div className="text-4xl font-bold tracking-tight mb-1">
                  {(data?.credits || 0).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <span>累计消费</span>
                  <span className="font-semibold text-white/90">¥{(data?.totalSpent || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16 group-hover:scale-150 transition-transform duration-500" />
        </motion.div>

        {/* 总充值 - 现代卡片 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-100 transition-all duration-300 cursor-pointer group"
        >
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-8 bg-gray-100 rounded w-3/4" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <TrendingUp size={22} className="text-emerald-500" />
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium bg-emerald-50 px-2 py-1 rounded-full">
                  <ArrowUpRight size={12} />
                  <span>收入</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-1">总充值</div>
              <div className="text-2xl font-bold text-gray-900">
                +{(data?.totalRecharge || 0).toLocaleString()}
              </div>
            </>
          )}
        </motion.div>

        {/* 总消费 - 现代卡片 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-rose-100 transition-all duration-300 cursor-pointer group"
        >
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-8 bg-gray-100 rounded w-3/4" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                  <TrendingDown size={22} className="text-rose-500" />
                </div>
                <div className="flex items-center gap-1 text-rose-500 text-xs font-medium bg-rose-50 px-2 py-1 rounded-full">
                  <ArrowUpRight size={12} className="rotate-90" />
                  <span>支出</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-1">总消费</div>
              <div className="text-2xl font-bold text-gray-900">
                {(data?.totalConsume || 0).toLocaleString()}
              </div>
            </>
          )}
        </motion.div>

        {/* 快捷操作 - 现代卡片 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
              <Gift size={22} className="text-violet-500" />
            </div>
            <span className="text-xs text-gray-400 font-medium">快捷入口</span>
          </div>
          <button
            onClick={openRedeemModal}
            className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Ticket size={18} />
            兑换积分
          </button>
        </motion.div>
      </div>

      {/* 图表和交易记录 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 趋势图 - 优化设计 */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <History size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">积分变动趋势</h3>
                  <p className="text-xs text-gray-400">近{dateRange}天数据统计</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-gray-500">充值</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="text-gray-500">消费</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="h-64">
              {isLoading ? (
                <div className="animate-pulse h-full bg-gray-50 rounded-xl" />
              ) : (
                <Line data={trendChartData} options={trendChartOptions} />
              )}
            </div>
          </div>
        </motion.div>

        {/* 分布图 - 优化设计 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Coins size={20} className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">积分分布</h3>
                <p className="text-xs text-gray-400">收支占比分析</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="h-64 flex items-center justify-center">
              {isLoading ? (
                <div className="animate-pulse w-40 h-40 bg-gray-50 rounded-full" />
              ) : (data?.totalRecharge || 0) + Math.abs(data?.totalConsume || 0) > 0 ? (
                <Doughnut
                  data={distributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 16,
                          usePointStyle: true,
                          pointStyle: 'circle',
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <Coins size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">暂无数据</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 最近交易记录 - 现代化表格设计 */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <ArrowRightLeft size={20} className="text-indigo-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">最近交易</h3>
                <p className="text-xs text-gray-400">最新的积分变动记录</p>
              </div>
            </div>
            {data?.recentTransactions && data.recentTransactions.length > 0 && (
              <a
                href="/dashboard/credits"
                className="text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
              >
                查看全部
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <span className="loading loading-spinner loading-md text-gray-300" />
            </div>
          ) : !data?.recentTransactions?.length ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <History size={28} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">暂无交易记录</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">类型</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">变动</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">余额</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">描述</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'recharge' ? 'bg-emerald-50' :
                          tx.type === 'consume' ? 'bg-rose-50' : 'bg-amber-50'
                        }`}>
                          {tx.type === 'recharge' ? (
                            <TrendingUp size={16} className="text-emerald-500" />
                          ) : tx.type === 'consume' ? (
                            <TrendingDown size={16} className="text-rose-500" />
                          ) : (
                            <ArrowRightLeft size={16} className="text-amber-500" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{getTypeText(tx.type)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`text-sm font-semibold ${
                        tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5">
                        <Coins size={14} className="text-amber-400" />
                        <span className="text-sm text-gray-600">{tx.balance}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-sm text-gray-500 max-w-[200px] truncate block">
                        {tx.description}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-sm text-gray-400">
                        {formatDateTimeShort(tx.created_time)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* 兑换积分弹窗 - 现代化设计 */}
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white p-0 rounded-t-3xl sm:rounded-2xl max-w-md">
          {/* 头部 */}
          <div className="relative p-6 pb-4">
            <button
              onClick={closeRedeemModal}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-200">
                <Ticket size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">兑换积分</h3>
                <p className="text-sm text-gray-400">输入兑换码获取积分</p>
              </div>
            </div>
          </div>

          {redeemResult?.success ? (
            /* 兑换成功显示 */
            <div className="px-6 pb-6">
              <div className="text-center py-6 bg-emerald-50 rounded-2xl">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h4 className="text-xl font-bold text-emerald-600 mb-2">兑换成功</h4>
                <p className="text-gray-600">
                  获得 <span className="font-bold text-amber-500">{redeemResult.creditAmount}</span> 积分
                </p>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-400 text-center mb-1">当前积分余额</div>
                <div className="text-2xl font-bold flex items-center justify-center gap-2 text-gray-900">
                  <Coins size={22} className="text-amber-400" />
                  {redeemResult.newBalance?.toLocaleString()}
                </div>
              </div>
              <button
                onClick={closeRedeemModal}
                className="w-full mt-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors"
              >
                完成
              </button>
            </div>
          ) : (
            /* 输入兑换码 */
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  兑换码
                </label>
                <input
                  type="text"
                  placeholder="例如：WELCOME100"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all uppercase font-mono tracking-wider"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isRedeeming) {
                      handleRedeem();
                    }
                  }}
                  disabled={isRedeeming}
                  autoFocus
                />
              </div>

              {redeemResult && !redeemResult.success && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl text-sm">
                  <X size={16} />
                  <span>{redeemResult.message}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeRedeemModal}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                  disabled={isRedeeming}
                >
                  取消
                </button>
                <button
                  onClick={handleRedeem}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  disabled={isRedeeming || !redeemCode.trim()}
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>兑换中</span>
                    </>
                  ) : (
                    <>
                      <Ticket size={18} />
                      <span>确认兑换</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeRedeemModal}>close</button>
        </form>
      </dialog>
    </motion.div>
  );
}

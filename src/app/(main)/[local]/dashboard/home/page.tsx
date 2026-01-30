'use client';
import React, { useEffect, useState, useRef } from 'react';
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
  Wallet,
  X,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { config } from '@/config';
import toast from 'react-hot-toast';

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

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  // 趋势图配置
  const trendChartData = {
    labels: data?.dailyData?.labels || [],
    datasets: [
      {
        label: '充值',
        data: data?.dailyData?.recharge || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: '消费',
        data: data?.dailyData?.consume || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // 分布图数据
  const distributionData = {
    labels: ['充值', '消费'],
    datasets: [
      {
        data: [data?.totalRecharge || 0, Math.abs(data?.totalConsume || 0)],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
        borderWidth: 2,
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
    <div className="space-y-6">
      {/* 时间范围选择 */}
      <div className="flex justify-end">
        <div className="join">
          <button
            className={`join-item btn btn-sm ${dateRange === 7 ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setDateRange(7)}
          >
            近7天
          </button>
          <button
            className={`join-item btn btn-sm ${dateRange === 30 ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setDateRange(30)}
          >
            近30天
          </button>
        </div>
      </div>

      {/* 主要统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 当前积分 - 大卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg"
        >
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-white/30 rounded w-1/2"></div>
              <div className="h-10 bg-white/30 rounded w-3/4"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Coins size={20} />
                <span className="text-white/80 text-sm font-medium">当前积分</span>
              </div>
              <div className="text-4xl font-bold">
                {(data?.credits || 0).toLocaleString()}
              </div>
              <div className="text-white/70 text-sm mt-2">
                累计消费 ¥{(data?.totalSpent || 0).toFixed(2)}
              </div>
            </>
          )}
        </motion.div>

        {/* 总充值 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-base-100 rounded-2xl p-5 shadow-md border border-base-300/50"
        >
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-base-300 rounded w-1/2"></div>
              <div className="h-8 bg-base-300 rounded w-3/4"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-success/10 rounded-lg">
                  <TrendingUp size={18} className="text-success" />
                </div>
                <span className="text-base-content/60 text-sm">总充值</span>
              </div>
              <div className="text-2xl font-bold text-success">
                +{(data?.totalRecharge || 0).toLocaleString()}
              </div>
            </>
          )}
        </motion.div>

        {/* 总消费 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-base-100 rounded-2xl p-5 shadow-md border border-base-300/50"
        >
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-base-300 rounded w-1/2"></div>
              <div className="h-8 bg-base-300 rounded w-3/4"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-error/10 rounded-lg">
                  <TrendingDown size={18} className="text-error" />
                </div>
                <span className="text-base-content/60 text-sm">总消费</span>
              </div>
              <div className="text-2xl font-bold text-error">
                {(data?.totalConsume || 0).toLocaleString()}
              </div>
            </>
          )}
        </motion.div>

        {/* 快捷操作 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-base-100 rounded-2xl p-5 shadow-md border border-base-300/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Gift size={18} className="text-primary" />
            </div>
            <span className="text-base-content/60 text-sm">快捷操作</span>
          </div>
          <button
            onClick={openRedeemModal}
            className="btn btn-primary btn-sm w-full gap-2"
          >
            <Ticket size={16} />
            兑换积分
          </button>
        </motion.div>
      </div>

      {/* 图表和交易记录 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 趋势图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-base-100 rounded-2xl p-5 shadow-md border border-base-300/50"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <History size={20} className="text-primary" />
            近{dateRange}天积分变动
          </h3>
          <div className="h-64">
            {isLoading ? (
              <div className="animate-pulse h-full bg-base-300 rounded"></div>
            ) : (
              <Line data={trendChartData} options={trendChartOptions} />
            )}
          </div>
        </motion.div>

        {/* 分布图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-base-100 rounded-2xl p-5 shadow-md border border-base-300/50"
        >
          <h3 className="text-lg font-semibold mb-4">积分分布</h3>
          <div className="h-64 flex items-center justify-center">
            {isLoading ? (
              <div className="animate-pulse w-40 h-40 bg-base-300 rounded-full"></div>
            ) : (data?.totalRecharge || 0) + Math.abs(data?.totalConsume || 0) > 0 ? (
              <Doughnut
                data={distributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            ) : (
              <div className="text-center text-base-content/50">
                <Coins size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无数据</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 最近交易记录 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-base-100 rounded-2xl shadow-md border border-base-300/50"
      >
        <div className="p-5 border-b border-base-300">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History size={20} className="text-primary" />
            最近交易记录
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>类型</th>
                <th>积分变动</th>
                <th>余额</th>
                <th>描述</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <span className="loading loading-spinner loading-md"></span>
                  </td>
                </tr>
              ) : !data?.recentTransactions?.length ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-base-content/50">
                    暂无交易记录
                  </td>
                </tr>
              ) : (
                data.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover">
                    <td>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.type)}
                        <span className="text-sm">{getTypeText(tx.type)}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`font-semibold ${
                          tx.amount > 0 ? 'text-success' : 'text-error'
                        }`}
                      >
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Coins size={14} className="text-warning" />
                        {tx.balance}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-base-content/70 max-w-[200px] truncate block">
                        {tx.description}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-base-content/50">
                        {formatDate(tx.created_time)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data?.recentTransactions && data.recentTransactions.length > 0 && (
          <div className="p-4 border-t border-base-300 text-center">
            <a href="/dashboard/credits" className="link link-primary text-sm">
              查看全部记录 →
            </a>
          </div>
        )}
      </motion.div>

      {/* 兑换积分弹窗 */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <button
            onClick={closeRedeemModal}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            <X size={18} />
          </button>

          <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Ticket size={20} className="text-primary" />
            兑换积分
          </h3>

          {redeemResult?.success ? (
            // 兑换成功显示
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h4 className="text-xl font-bold text-success mb-2">兑换成功！</h4>
              <p className="text-base-content/70 mb-4">
                获得 <span className="font-bold text-warning">{redeemResult.creditAmount}</span> 积分
              </p>
              <div className="bg-base-200 rounded-xl p-4">
                <div className="text-sm text-base-content/60">当前积分余额</div>
                <div className="text-2xl font-bold flex items-center justify-center gap-2">
                  <Coins size={20} className="text-warning" />
                  {redeemResult.newBalance?.toLocaleString()}
                </div>
              </div>
              <button
                onClick={closeRedeemModal}
                className="btn btn-primary mt-6"
              >
                完成
              </button>
            </div>
          ) : (
            // 输入兑换码
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">请输入兑换码</span>
                </label>
                <input
                  type="text"
                  placeholder="例如：WELCOME100"
                  className="input input-bordered w-full uppercase"
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
                <div className="alert alert-error">
                  <span>{redeemResult.message}</span>
                </div>
              )}

              <div className="modal-action">
                <button
                  onClick={closeRedeemModal}
                  className="btn btn-ghost"
                  disabled={isRedeeming}
                >
                  取消
                </button>
                <button
                  onClick={handleRedeem}
                  className="btn btn-primary gap-2"
                  disabled={isRedeeming || !redeemCode.trim()}
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      兑换中...
                    </>
                  ) : (
                    <>
                      <Ticket size={16} />
                      确认兑换
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
    </div>
  );
}

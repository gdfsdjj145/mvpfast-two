'use client';

import React, { useState, useEffect } from 'react';
import {
  Coins,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Calendar,
  User,
  Ticket,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface CreditTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balance: number;
  orderId: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  created_time: string;
}

// 管理员统计
interface AdminStats {
  totalUsers: number;
  usersWithCredits: number;
  totalCreditsInSystem: number;
  totalRechargeAmount: number;
  totalConsumeAmount: number;
  recentTransactions: number;
}

// 用户统计
interface UserStats {
  currentCredits: number;
  totalSpent: number;
  totalRecharge: number;
  totalConsume: number;
  totalTransactions: number;
}

export default function CreditsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // 判断是否为管理员
  const userRole = session?.user?.role || 'user';
  const isAdmin = userRole === 'admin';

  // 获取交易记录
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        stats: 'true',
      });
      if (typeFilter) params.set('type', typeFilter);

      // 根据角色使用不同的API
      let url: string;
      if (isAdmin) {
        if (search) params.set('userId', search);
        url = `/api/admin/credits?${params}`;
      } else {
        url = `/api/user/credits?${params}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setTransactions(data.data.transactions);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.total);
        if (data.stats) {
          if (isAdmin) {
            setAdminStats(data.stats);
          } else {
            setUserStats(data.stats);
          }
        }
      } else {
        toast.error(data.error || '获取积分记录失败');
      }
    } catch (error) {
      toast.error('获取积分记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, isAdmin]);

  // 搜索处理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 渲染类型标签
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case 'recharge':
        return (
          <span className="badge badge-success badge-sm gap-1">
            <TrendingUp size={12} />
            充值
          </span>
        );
      case 'consume':
        return (
          <span className="badge badge-error badge-sm gap-1">
            <TrendingDown size={12} />
            消费
          </span>
        );
      case 'refund':
        return (
          <span className="badge badge-warning badge-sm gap-1">
            <ArrowRightLeft size={12} />
            退款
          </span>
        );
      default:
        return (
          <span className="badge badge-ghost badge-sm">{type}</span>
        );
    }
  };

  // 检查是否为兑换码充值
  const isRedemptionRecharge = (tx: CreditTransaction): boolean => {
    return tx.description?.includes('兑换码') ||
           (tx.metadata as Record<string, unknown>)?.codeId !== undefined;
  };

  return (
    <div className="space-y-4">
      {/* 管理员统计卡片 */}
      {isAdmin && adminStats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-primary">
              <User size={24} />
            </div>
            <div className="stat-title text-xs">有积分用户</div>
            <div className="stat-value text-2xl">{adminStats.usersWithCredits ?? 0}</div>
            <div className="stat-desc">总用户 {adminStats.totalUsers ?? 0}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-warning">
              <Coins size={24} />
            </div>
            <div className="stat-title text-xs">系统总积分</div>
            <div className="stat-value text-2xl">{(adminStats.totalCreditsInSystem ?? 0).toLocaleString()}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-success">
              <TrendingUp size={24} />
            </div>
            <div className="stat-title text-xs">总充值</div>
            <div className="stat-value text-2xl text-success">+{(adminStats.totalRechargeAmount ?? 0).toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* 用户统计卡片 */}
      {!isAdmin && userStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-warning">
              <Coins size={24} />
            </div>
            <div className="stat-title text-xs">当前积分</div>
            <div className="stat-value text-2xl">{(userStats.currentCredits ?? 0).toLocaleString()}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-success">
              <TrendingUp size={24} />
            </div>
            <div className="stat-title text-xs">累计充值</div>
            <div className="stat-value text-2xl text-success">+{(userStats.totalRecharge ?? 0).toLocaleString()}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-error">
              <TrendingDown size={24} />
            </div>
            <div className="stat-title text-xs">累计消费</div>
            <div className="stat-value text-2xl text-error">-{(userStats.totalConsume ?? 0).toLocaleString()}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-xl p-4">
            <div className="stat-figure text-primary">
              <Calendar size={24} />
            </div>
            <div className="stat-title text-xs">交易记录</div>
            <div className="stat-value text-2xl">{userStats.totalTransactions ?? 0}</div>
          </div>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* 管理员可以搜索用户ID */}
            {isAdmin && (
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="join flex-1">
                  <input
                    type="text"
                    placeholder="搜索用户ID..."
                    className="input input-bordered join-item flex-1 input-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary join-item btn-sm">
                    <Search size={16} />
                  </button>
                </div>
              </form>
            )}
            <select
              className="select select-bordered select-sm"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部类型</option>
              <option value="recharge">充值</option>
              <option value="consume">消费</option>
              <option value="refund">退款</option>
            </select>
            <button
              onClick={() => fetchTransactions()}
              className="btn btn-ghost btn-sm btn-square"
              title="刷新"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* 交易记录列表 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  {isAdmin && <th>用户ID</th>}
                  <th>类型</th>
                  <th>积分变动</th>
                  <th>余额</th>
                  <th>描述</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                      <span className="loading loading-spinner loading-md"></span>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-base-content/60">
                      暂无积分记录
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover">
                      {isAdmin && (
                        <td>
                          <code className="text-xs font-mono bg-base-200 px-1 rounded">
                            {tx.userId.slice(-8)}
                          </code>
                        </td>
                      )}
                      <td>{renderTypeBadge(tx.type)}</td>
                      <td>
                        <span className={`font-semibold ${tx.amount > 0 ? 'text-success' : 'text-error'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Coins size={14} className="text-warning" />
                          {tx.balance}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 max-w-[200px]">
                          {isRedemptionRecharge(tx) && (
                            <Ticket size={14} className="text-primary flex-shrink-0" />
                          )}
                          <span className="truncate text-sm" title={tx.description}>
                            {tx.description}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-xs text-base-content/60">
                          <Calendar size={12} />
                          {formatDate(tx.created_time)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="flex justify-between items-center p-4 border-t border-base-300">
            <div className="text-sm text-base-content/60">
              共 {total} 条记录，第 {page}/{totalPages || 1} 页
            </div>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <button className="join-item btn btn-sm">第 {page} 页</button>
              <button
                className="join-item btn btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

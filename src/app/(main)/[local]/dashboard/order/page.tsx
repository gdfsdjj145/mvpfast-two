'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Filter,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { config } from '@/config';
import { formatDateTime } from '@/lib/utils/common';

interface Order {
  id: string;
  created_time: string;
  identifier: string;
  name: string;
  orderId: string;
  orderType: string;
  price: number;
  promoter?: string | null;
  promotionPrice: number;
  transactionId: string;
  creditAmount?: number | null;
}

interface OrderStats {
  totalOrders: number;
  todayOrders: number;
  monthOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // 是否为积分模式
  const isCreditsMode = config.purchaseMode === 'credits';

  // 分页
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 筛选
  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 加载订单列表
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        stats: 'true',
      });

      if (search) params.set('search', search);
      if (orderType) params.set('orderType', orderType);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const response = await fetch(`/api/admin/orders?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '加载失败');
      }

      const data = await response.json();
      setOrders(data.data.orders);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error: any) {
      toast.error(error.message || '加载订单失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, orderType, startDate, endDate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // 搜索处理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadOrders();
  };

  // 重置筛选
  const handleReset = () => {
    setSearch('');
    setOrderType('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // 删除订单
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条订单记录吗？此操作不可恢复。')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/admin/orders?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '删除失败');
      }

      toast.success('删除成功');
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || '删除失败');
    } finally {
      setDeleting(null);
    }
  };

  // 格式化金额
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(price);
  };

  // 格式化日期

  // 订单类型标签
  const renderOrderType = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      product: { label: '商品购买', color: 'badge-primary' },
      credit: { label: '积分充值', color: 'badge-secondary' },
    };
    const config = types[type] || { label: type, color: 'badge-ghost' };
    return <span className={`badge ${config.color} badge whitespace-nowrap`}>{config.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div className="card-body p-4 flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShoppingCart size={20} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-base-content/50">总订单</p>
                <p className="text-xl font-bold truncate">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div className="card-body p-4 flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Calendar size={20} className="text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-base-content/50">今日订单</p>
                <p className="text-xl font-bold truncate">{stats.todayOrders}</p>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div className="card-body p-4 flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <DollarSign size={20} className="text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-base-content/50">总收入</p>
                <p className="text-xl font-bold truncate">{formatPrice(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div className="card-body p-4 flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                <TrendingUp size={20} className="text-info" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-base-content/50">本月收入</p>
                <p className="text-xl font-bold truncate">{formatPrice(stats.monthRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 筛选区域 */}
      <div className="card bg-base-100 border border-base-200">
        <div className="card-body p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
            <div className="form-control flex-1 min-w-[180px]">
              <input
                type="text"
                placeholder="搜索订单号、交易号、用户..."
                className="input input-bordered input-md w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {isCreditsMode && (
              <div className="form-control">
                <select
                  className="select select-bordered select-md"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <option value="">全部类型</option>
                  <option value="product">商品购买</option>
                  <option value="credit">积分充值</option>
                </select>
              </div>
            )}

            <div className="form-control">
              <input
                type="date"
                className="input input-bordered input-md"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-control">
              <input
                type="date"
                className="input input-bordered input-md"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary gap-1" disabled={loading}>
                {loading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Search size={14} />
                )}
                搜索
              </button>
              <button type="button" onClick={handleReset} className="btn btn-ghost gap-1" disabled={loading}>
                <Filter size={14} />
                重置
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="card bg-base-100 border border-base-200 overflow-hidden">
        <div className="card-body p-4 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">订单列表</h2>
            <div className="text-sm text-base-content/50">共 {total} 条</div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-base-content/20 mb-4" />
              <p className="text-base-content/50">暂无订单记录</p>
            </div>
          ) : (
            <>
              {/* daisyUI table: pin-rows 固定表头, pin-cols 固定首尾th列 */}
              <div className="overflow-x-auto max-w-full">
                <table className="table table-pin-rows table-pin-cols table-zebra">
                  <thead>
                    <tr>
                      <th>序号</th>
                      <td>订单号</td>
                      <td>商品</td>
                      {isCreditsMode && <td>类型</td>}
                      <td>用户</td>
                      <td>金额</td>
                      <td>交易号</td>
                      <td>时间</td>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={order.id} className="hover">
                        <th>{(page - 1) * pageSize + index + 1}</th>
                        <td>
                          <span className="font-mono text-xs">{order.orderId}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {isCreditsMode && order.orderType === 'credit' ? (
                              <CreditCard size={14} className="text-secondary shrink-0" />
                            ) : (
                              <Package size={14} className="text-primary shrink-0" />
                            )}
                            <span>{order.name}</span>
                            {isCreditsMode && order.creditAmount && (
                              <span className="badge-secondary shrink-0">
                                +{order.creditAmount}
                              </span>
                            )}
                          </div>
                        </td>
                        {isCreditsMode && <td>{renderOrderType(order.orderType)}</td>}
                        <td>
                          <span className="text-xs">{order.identifier}</span>
                        </td>
                        <td>
                          <span className="font-semibold text-success">
                            {formatPrice(order.price)}
                          </span>
                          {order.promotionPrice > 0 && (
                            <div className="text-xs text-warning">
                              返利 {formatPrice(order.promotionPrice)}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="font-mono text-xs text-base-content/60">{order.transactionId}</span>
                        </td>
                        <td>
                          <span className="text-xs text-base-content/60">
                            {formatDateTime(order.created_time)}
                          </span>
                        </td>
                        <th>
                          <button
                            onClick={() => handleDelete(order.id)}
                            disabled={deleting === order.id}
                            className="btn btn-ghost btn-xs text-error"
                          >
                            {deleting === order.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </th>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="join">
                    <button
                      className="join-item btn"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`join-item btn ${page === pageNum ? 'btn-primary' : ''}`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      className="join-item btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

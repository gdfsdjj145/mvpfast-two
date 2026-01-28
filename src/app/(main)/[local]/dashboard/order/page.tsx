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
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  // 订单类型标签
  const renderOrderType = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      product: { label: '商品购买', color: 'badge-primary' },
      credit: { label: '积分充值', color: 'badge-secondary' },
    };
    const config = types[type] || { label: type, color: 'badge-ghost' };
    return <span className={`badge ${config.color} badge-sm`}>{config.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-figure text-primary">
              <ShoppingCart size={24} />
            </div>
            <div className="stat-title">总订单数</div>
            <div className="stat-value text-primary">{stats.totalOrders}</div>
          </div>

          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-figure text-secondary">
              <Calendar size={24} />
            </div>
            <div className="stat-title">今日订单</div>
            <div className="stat-value text-secondary">{stats.todayOrders}</div>
          </div>

          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-figure text-success">
              <DollarSign size={24} />
            </div>
            <div className="stat-title">总收入</div>
            <div className="stat-value text-success text-2xl">{formatPrice(stats.totalRevenue)}</div>
          </div>

          <div className="stat bg-base-100 rounded-xl shadow">
            <div className="stat-figure text-info">
              <TrendingUp size={24} />
            </div>
            <div className="stat-title">本月收入</div>
            <div className="stat-value text-info text-2xl">{formatPrice(stats.monthRevenue)}</div>
          </div>
        </div>
      )}

      {/* 筛选区域 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            {/* 搜索框 */}
            <div className="form-control flex-1 min-w-[200px]">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="搜索订单号、交易号、用户..."
                  className="input input-bordered w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* 订单类型 - 仅积分模式显示 */}
            {isCreditsMode && (
              <div className="form-control w-40">
                <select
                  className="select select-bordered"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <option value="">全部类型</option>
                  <option value="product">商品购买</option>
                  <option value="credit">积分充值</option>
                </select>
              </div>
            )}

            {/* 开始日期 */}
            <div className="form-control">
              <input
                type="date"
                className="input input-bordered"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* 结束日期 */}
            <div className="form-control">
              <input
                type="date"
                className="input input-bordered"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* 按钮组 */}
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary gap-2">
                <Search size={16} />
                搜索
              </button>
              <button type="button" onClick={handleReset} className="btn btn-ghost gap-2">
                <Filter size={16} />
                重置
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">订单列表</h2>
            <div className="text-sm text-base-content/60">共 {total} 条记录</div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-base-content/30 mb-4" />
              <p className="text-base-content/60">暂无订单记录</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>订单号</th>
                      <th>商品名称</th>
                      {isCreditsMode && <th>类型</th>}
                      <th>用户</th>
                      <th>金额</th>
                      <th>交易号</th>
                      <th>创建时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <code className="text-xs bg-base-200 px-2 py-1 rounded">
                            {order.orderId}
                          </code>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {isCreditsMode && order.orderType === 'credit' ? (
                              <CreditCard size={16} className="text-secondary" />
                            ) : (
                              <Package size={16} className="text-primary" />
                            )}
                            <span>{order.name}</span>
                            {isCreditsMode && order.creditAmount && (
                              <span className="badge badge-sm badge-secondary">
                                +{order.creditAmount} 积分
                              </span>
                            )}
                          </div>
                        </td>
                        {isCreditsMode && <td>{renderOrderType(order.orderType)}</td>}
                        <td>
                          <span className="text-sm">{order.identifier}</span>
                        </td>
                        <td>
                          <span className="font-medium text-success">
                            {formatPrice(order.price)}
                          </span>
                          {order.promotionPrice > 0 && (
                            <div className="text-xs text-warning">
                              推广返利: {formatPrice(order.promotionPrice)}
                            </div>
                          )}
                        </td>
                        <td>
                          <code className="text-xs bg-base-200 px-2 py-1 rounded">
                            {order.transactionId}
                          </code>
                        </td>
                        <td>
                          <span className="text-sm">{formatDate(order.created_time)}</span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(order.id)}
                            disabled={deleting === order.id}
                            className="btn btn-ghost btn-sm text-error"
                          >
                            {deleting === order.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </td>
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
                          className={`join-item btn ${page === pageNum ? 'btn-active' : ''}`}
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

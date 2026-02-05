'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { config } from '@/config';
import { formatDateTime } from '@/lib/utils/common';
import { ShoppingBag, FileText, Clock, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';

type Order = {
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
};

export default function MyOrdersPage() {
  const { data: session } = useSession();
  const purchaseMode = config.purchaseMode;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [orderType, setOrderType] = useState('');
  const pageSize = 10;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (orderType) params.set('orderType', orderType);

      const res = await fetch(`/api/user/orders?${params}`);
      const result = await res.json();

      if (result.success) {
        setOrders(result.data.orders);
        setTotalPages(result.data.totalPages);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page, orderType]);

  useEffect(() => {
    if (session?.user?.id) {
      loadOrders();
    }
  }, [session, loadOrders]);

  const renderOrderType = (type: string) => {
    if (type === 'credit') {
      return <span className="badge badge-secondary whitespace-nowrap">积分充值</span>;
    }
    return <span className="badge badge-primary whitespace-nowrap">商品购买</span>;
  };


  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <div className="card-body p-4 flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ShoppingBag size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">总订单</p>
              <p className="text-xl font-bold">{total}</p>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow duration-200 cursor-pointer">
          <div className="card-body p-4 flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
              <CreditCard size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-xs text-base-content/50">总消费</p>
              <p className="text-xl font-bold">
                ¥{orders.reduce((sum, o) => sum + o.price, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        {purchaseMode === 'credits' && (
          <div className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div className="card-body p-4 flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-xs text-base-content/50">获得积分</p>
                <p className="text-xl font-bold">
                  {orders.reduce((sum, o) => sum + (o.creditAmount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 筛选 */}
      <div className="flex items-center gap-3">
        <select
          className="select select-md select-bordered rounded-xl"
          value={orderType}
          onChange={(e) => { setOrderType(e.target.value); setPage(1); }}
        >
          <option value="">全部订单</option>
          <option value="credit">积分充值</option>
          {config.goods.map((g) => (
            <option key={g.key} value={g.key}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* 订单列表 */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : orders.length === 0 ? (
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body items-center text-center py-16">
            <ShoppingBag size={48} className="text-base-content/20" />
            <p className="text-base-content/50 mt-4">暂无订单记录</p>
          </div>
        </div>
      ) : (
        <>
          {/* 桌面端表格 */}
          <div className="hidden md:block card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
              <thead className="bg-base-200/50">
                <tr className="text-base-content/70">
                  <th className="font-semibold">订单编号</th>
                  <th className="font-semibold">商品</th>
                  {purchaseMode === 'credits' && <th className="font-semibold">类型</th>}
                  <th className="font-semibold">金额</th>
                  {purchaseMode === 'credits' && <th className="font-semibold">积分</th>}
                  <th className="font-semibold">交易号</th>
                  <th className="font-semibold">时间</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="hover">
                    <td>
                      <span className="font-mono text-sm">{order.orderId}</span>
                    </td>
                    <td className="font-medium text-base">{order.name}</td>
                    {purchaseMode === 'credits' && (
                      <td>{renderOrderType(order.orderType)}</td>
                    )}
                    <td>
                      <span className="font-semibold text-base">¥{order.price.toFixed(2)}</span>
                      {order.promotionPrice > 0 && (
                        <span className="text-sm text-success ml-2">-¥{order.promotionPrice}</span>
                      )}
                    </td>
                    {purchaseMode === 'credits' && (
                      <td>
                        {order.creditAmount ? (
                          <span className="text-secondary font-semibold text-base">+{order.creditAmount}</span>
                        ) : (
                          <span className="text-base-content/30">-</span>
                        )}
                      </td>
                    )}
                    <td>
                      <span className="font-mono text-sm text-base-content/60 max-w-[160px] truncate block">
                        {order.transactionId}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-base-content/60 flex items-center gap-1.5">
                        <Clock size={14} />
                        {formatDateTime(order.created_time)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>

          {/* 移动端卡片 */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="card-body p-4 gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{order.name}</span>
                    {purchaseMode === 'credits' && renderOrderType(order.orderType)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/50">金额</span>
                    <span className="font-semibold">¥{order.price.toFixed(2)}</span>
                  </div>
                  {purchaseMode === 'credits' && order.creditAmount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-base-content/50">积分</span>
                      <span className="text-secondary font-medium">+{order.creditAmount}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-base-content/50">
                    <span className="font-mono">{order.orderId}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatDateTime(order.created_time)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="join">
                <button
                  className="join-item btn"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <button className="join-item btn btn-disabled">...</button>
                      )}
                      <button
                        className={`join-item btn ${p === page ? 'btn-primary' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
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
  );
}

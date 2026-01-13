'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getOrdersByUserId, createMockOrder, deleteOrder } from './actions';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function OrderPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<{
    id: string;
    name: string;
    price: number;
    orderId: string;
    transactionId: string;
    created_time: Date;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setIsLoading(true);
          const result = await getOrdersByUserId(session.user.id);
          setOrders(result.data || []);
        } catch (error) {
          console.error('获取订单失败:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (status !== 'loading') {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [status, session]);

  const renderLoading = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-bounce">
        <div className="w-16 h-16 bg-pink-300 rounded-full flex items-center justify-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-pink-500 rounded-full"></div>
          </div>
        </div>
        <div className="text-center mt-4 text-pink-500 font-bold">
          加载中...
        </div>
      </div>
    </div>
  );

  const handlePurchase = async (type: string, price: number, name: string) => {
    if (!session?.user?.id) {
      toast.error('请先登录');
      return;
    }

    const orderData = {
      type,
      price,
      name,
    };

    const result = await createMockOrder(session.user.id, orderData);

    if (result.success) {
      toast.success('购买成功');
      // 刷新订单列表
      const ordersResult = await getOrdersByUserId(session.user.id);
      setOrders(ordersResult.data || []);
    } else {
      toast.error('购买失败');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (confirm('确定要删除这条购买记录吗？')) {
      const result = await deleteOrder(orderId);
      if (result.success) {
        toast.success('删除成功');
        // 刷新订单列表
        const ordersResult = await getOrdersByUserId(session?.user?.id ?? '');
        setOrders(ordersResult.data || []);
      } else {
        toast.error('删除失败');
      }
    }
  };

  return (
    <div className="flex gap-6">
      {/* 左侧订单列表 */}
      <div className="flex-1 bg-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">购买记录</h2>
        {isLoading ? (
          renderLoading()
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-600 mb-4">
              暂无购买记录
            </h3>
            <p className="text-gray-500">立即购买以获取更多功能！</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row">
                    <img
                      src="/banners/banner.png"
                      alt="mvpfast"
                      className="w-full md:w-1/3 rounded-lg md:mr-6 mb-4 md:mb-0"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          {order.name}
                        </h2>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="btn btn-sm btn-error btn-outline"
                        >
                          删除
                        </button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-secondary">
                          <i className="fas fa-money-bill-wave mr-2"></i>金额: ¥
                          {order.price}
                        </p>
                        <p className="text-sm text-gray-600">
                          <i className="fas fa-hashtag mr-2"></i>订单号:{' '}
                          {order.orderId}
                        </p>
                        <p className="text-sm text-gray-600">
                          <i className="fas fa-receipt mr-2"></i>支付号:{' '}
                          {order.transactionId}
                        </p>
                        <p className="text-sm text-gray-600">
                          <i className="fas fa-calendar-alt mr-2"></i>支付时间:{' '}
                          {new Date(order.created_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 右侧购买区域 */}
      <div className="w-80 bg-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">模拟购买</h2>
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">基础版</h3>
            <p className="text-gray-600 mb-4">适合个人开发者使用</p>
            <p className="text-2xl font-bold text-primary mb-4">¥99</p>
            <button
              onClick={() => handlePurchase('normal', 99, '基础版')}
              className="w-full btn btn-primary"
            >
              立即购买
            </button>
          </div>

          <div className="p-4 border rounded-lg bg-linear-to-r from-purple-50 to-pink-50">
            <h3 className="text-lg font-semibold mb-2">专业版</h3>
            <p className="text-gray-600 mb-4">适合团队使用</p>
            <p className="text-2xl font-bold text-primary mb-4">¥299</p>
            <button
              onClick={() => handlePurchase('most', 299, '专业版')}
              className="w-full btn btn-primary"
            >
              立即购买
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

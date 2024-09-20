'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getOrdersByUserId } from './actions';
import { config } from '@/config';
import Link from 'next/link';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setIsLoading(true);
          const result = await getOrdersByUserId(session.user.id);
          console.log(result);
          setOrders(result.data);
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {isLoading ? (
          renderLoading()
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              暂无购买记录
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              立即购买以获取更多功能！
            </p>
            <Link
              href="/pay"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:from-pink-600 hover:to-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            >
              前往购买
            </Link>
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
                      src="/banner.png"
                      alt="mvpfast"
                      className="w-full md:w-1/3 rounded-lg md:mr-6 mb-4 md:mb-0"
                    />
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {config.description}
                      </h2>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-primary">
                          <i className="fas fa-money-bill-wave mr-2"></i>金额: ¥
                          {config.amount / 100}
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
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="mt-4 flex space-x-3">
                        <a
                          href="/pay"
                          className="btn px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          详情
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;

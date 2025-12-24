'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ClipboardCopyButton from '@/components/ClipboardBtn';
import { gerShareByUserId } from './actions';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function page() {
  const { data: session, status } = useSession();
  const [promotions, setPromotions] = useState<{
    promotionPrice: number;
    checkout: boolean;
    created_time: Date;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setIsLoading(true);
          const result = await gerShareByUserId(session.user.id);
          console.log(result);
          setPromotions(result.data);
        } catch (error) {
          console.error('获取分享数据失败:', error);
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
    <>
      {isLoading ? (
        renderLoading()
      ) : promotions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            暂无分享数据
          </h2>
          <p className="text-xl text-gray-600 mb-8">立即分享，获取收益！</p>
          <ClipboardCopyButton
            text={`${location.host}/pay?key=most&sharecode=${session?.user?.id}`}
            cb={() => {
              toast.success('复制连接成功');
            }}
          >
            <div className="inline-block bg-linear-to-r cursor-pointer from-pink-500 to-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:from-pink-600 hover:to-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110">
              复制分享链接
            </div>
          </ClipboardCopyButton>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto bg-white">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th></th>
                  <th>推广优惠</th>
                  <th>核销状态</th>
                  <th>支付时间</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {promotions.map((row, index) => (
                  <tr>
                    <th>{index + 1}</th>
                    <td>¥{row.promotionPrice}</td>
                    <td>{row.checkout ? '是' : '否'}</td>
                    <td>{new Date(row.created_time).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* {promotions.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {order.name}
                    </h2>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-secondary">
                        <i className="fas fa-money-bill-wave mr-2"></i>推广优惠:
                        ¥{order.promotionPrice}
                      </p>
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-hashtag mr-2"></i>核销状态:{' '}
                        {order.checkout ? '是' : '否'}
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
          ))} */}
          <div className="text-center">
            <ClipboardCopyButton
              text={`${location.host}/pay?key=most&sharecode=${session?.user?.id}`}
              cb={() => {
                toast.success('复制连接成功');
              }}
            >
              <div className="inline-block bg-linear-to-r cursor-pointer from-pink-500 to-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:from-pink-600 hover:to-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110">
                复制分享链接
              </div>
            </ClipboardCopyButton>
          </div>
        </div>
      )}
    </>
  );
}

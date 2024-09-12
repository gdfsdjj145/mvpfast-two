'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import { useSession } from 'next-auth/react';
import { config } from '@/config';
import { createOrder, checkUserPayment } from './actions';
import Link from 'next/link';

// 动态导入 WeChatPayQRCode 组件
const WeChatPayQRCode = dynamic(() => import('@/components/PayQrcode'), {
  loading: () => <p>加载支付二维码...</p>,
  ssr: false,
});

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const [orderInfo, setOrderInfo] = useState({
    orderId: 'xxxxxxxxx',
    amount: config.amount,
    description: config.description,
    createdAt: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'success', 'failed'
  const [paymentResult, setPaymentResult] = useState({
    transactionId: '',
    paidAt: '',
  });

  useEffect(() => {
    const checkPayment = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const result = await checkUserPayment(session.user.id);
          if (result.data.hasPaid) {
            setPaymentStatus('success');
            setPaymentResult({
              transactionId: result.data.transactionId,
              paidAt: new Date(result.data.createdAt).toLocaleString(),
            });
            setOrderInfo((prevState) => ({
              ...prevState,
              orderId: result.data.orderId,
              createdAt: new Date(result.data.createdAt).toLocaleString(),
            }));
          } else {
            setPaymentStatus('pending');
          }
        } catch (error) {
          console.error('检查支付状态失败:', error);
          setPaymentStatus('failed');
        }
      }
      setIsLoading(false);
    };

    checkPayment();
  }, [status, session]);

  const handlePaymentSuccess = async (result: {
    transactionId: string;
    paidAt: string;
  }) => {
    setPaymentStatus('success');
    setPaymentResult(result);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    await createOrder({
      identifier: session?.user.id,
      createdAt: new Date(result.paidAt),
      transactionId: result.transactionId,
      orderId: orderInfo.orderId,
    });
  };

  const handleCreateOrder = (order: any) => {
    setOrderInfo((prevState) => ({
      ...prevState,
      ...order,
    }));
  };

  const LoadingSpinner = () => (
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

  const renderRightContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (paymentStatus === 'success') {
      return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">订单详情</h2>
          <div className="space-y-4">
            <p>
              <span className="font-semibold">订单号：</span>
              {orderInfo.orderId}
            </p>
            <p>
              <span className="font-semibold">交易号：</span>
              {paymentResult.transactionId}
            </p>
            <p>
              <span className="font-semibold">支付金额：</span>¥
              {(orderInfo.amount / 100).toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">支付时间：</span>
              {paymentResult.paidAt}
            </p>
            <p>
              <span className="font-semibold">商品描述：</span>
              {orderInfo.description}
            </p>
          </div>
          <div className="mt-8">
            <Link href="/dashboard" className="btn btn-primary w-full">
              前往个人页面
            </Link>
          </div>
        </div>
      );
    }

    if (paymentStatus === 'pending') {
      return (
        <>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            微信扫码支付
          </h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <WeChatPayQRCode
              amount={orderInfo.amount}
              description={orderInfo.description}
              onPaymentSuccess={handlePaymentSuccess}
              onCreateOrder={handleCreateOrder}
            />
          </div>
        </>
      );
    }

    return <p>加载失败，请刷新页面重试</p>;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 左侧：商品信息 */}
      <div className="w-1/2 p-8 bg-white">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">订单详情</h2>
        <div className="bg-gray-50 rounded-lg shadow-md p-6">
          <div className="mb-4">
            <span className="font-semibold text-gray-700">订单号：</span>
            <span className="text-gray-600">{orderInfo.orderId}</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold text-gray-700">商品描述：</span>
            <span className="text-gray-600">{orderInfo.description}</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold text-gray-700">支付金额：</span>
            <span className="text-xl font-bold text-red-500">
              ¥{(orderInfo.amount / 100).toFixed(2)}
            </span>
          </div>
          <div className="mb-4">
            <span className="font-semibold text-gray-700">创建时间：</span>
            <span className="text-gray-600">{orderInfo.createdAt}</span>
          </div>
        </div>
        {paymentStatus === 'success' && (
          <div className="mt-6 bg-green-50 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-green-800">支付成功</h3>
            <div className="mb-2">
              <span className="font-semibold text-green-700">交易号：</span>
              <span className="text-green-600">
                {paymentResult.transactionId}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-green-700">支付时间：</span>
              <span className="text-green-600">{paymentResult.paidAt}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-green-700">客服微信：</span>
              <span className="text-green-600">
                <img className="w-36" src="/wechat.jpg" alt="" srcSet="" />
              </span>
            </div>
            <div className="text-gray-500">添加客服微信获取模板</div>
          </div>
        )}
        <div className="mt-6 text-sm text-gray-500">
          <p>请在15分钟内完成支付，否则订单将自动取消。</p>
          <p>如遇到问题，请联系客服wx：13022051583</p>
        </div>
      </div>

      {/* 右侧：支付二维码或订单详情 */}
      <div className="w-1/2 p-8 flex flex-col items-center justify-center bg-gray-50">
        {renderRightContent()}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import WeChatPayQRCode from '@/components/PayQrcode';

const BASEINFO = {
  amount: 29800,
  description: 'MvpFast模板购买',
};

export default function PaymentPage() {
  const [orderInfo, setOrderInfo] = useState({
    orderId: 'xxxxxxxxx',
    amount: BASEINFO.amount,
    description: BASEINFO.description,
    createdAt: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'success', 'failed'
  const [paymentResult, setPaymentResult] = useState({
    transactionId: '',
    paidAt: '',
  });

  useEffect(() => {
    // 模拟加载订单信息
    setTimeout(() => {
      setOrderInfo((prevState) => ({
        ...prevState,
        createdAt: new Date().toLocaleString(),
      }));
      setIsLoading(false);
    }, 1000);
  }, []);

  const handlePaymentSuccess = (result: {
    transactionId: string;
    paidAt: string;
  }) => {
    setPaymentStatus('success');
    setPaymentResult(result);
  };

  const handleCreateOrder = (order: any) => {
    setOrderInfo((prevState) => ({
      ...prevState,
      ...order,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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

      {/* 右侧：支付二维码 */}
      <div className="w-1/2 p-8 flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">微信扫码支付</h2>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <WeChatPayQRCode
            amount={orderInfo.amount}
            description={orderInfo.description}
            onPaymentSuccess={handlePaymentSuccess}
            onCreateOrder={handleCreateOrder}
          />
        </div>
      </div>
    </div>
  );
}

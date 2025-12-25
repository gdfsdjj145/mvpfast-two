'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import { useSession } from 'next-auth/react';
import { config } from '@/config';
import {
  createOrder,
  checkUserPayment,
  checkUserById,
  createPayOrder,
} from './actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useMessages } from 'next-intl';

// 动态导入 WeChatPayQRCode 组件
const WeChatPcPay = dynamic(() => import('@/components/weChat/WeChatPcPay'), {
  loading: () => <p>加载支付二维码...</p>,
  ssr: false,
});

const WeChatMobilePay = dynamic(
  () => import('@/components/weChat/WeChatMobilePay'),
  {
    loading: () => <p>加载支付二维码...</p>,
    ssr: false,
  }
);

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const goodKey = searchParams.get('key');
  const shareCode = searchParams.get('sharecode');
  const initialized = useRef(false);

  // 使用 next-intl 获取商品信息，与 PriceComponent 保持一致
  const messages = useMessages();
  const priceConfig = messages.Price as any;
  const goodsObj = priceConfig.goods;
  const goods = Object.keys(goodsObj).map((key) => ({
    ...goodsObj[key],
    key,
  }));

  // 根据 goodKey 查找对应的商品
  const good = goods.find((item) => item.key === goodKey) || {
    key: '',
    price: 0,
    description: '',
    name: '',
  };

  const [orderInfo, setOrderInfo] = useState({
    orderId: 'xxxxxxxxx',
    amount: good.price * 100,
    description: good.description,
    created_time: '',
    shareId: '',
  });
  const [shareOption, setShareOption] = useState({
    code: '',
    sharePrice: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(''); // 'pending', 'success', 'failed'
  const [paymentResult, setPaymentResult] = useState({
    transactionId: '',
    paidAt: '',
  });

  const [payType, setPayType] = useState('');
  const [isH5Browser, setIsH5Browser] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  // 获取可用的支付方式
  const availablePayments = config.payConfig.filter((payment) => payment.use);

  useEffect(() => {
    const getShare = async () => {
      if (status === 'authenticated' && session) {
        const { data } = await checkUserById(shareCode ?? '');
        if (data) {
          setShareOption({
            code: data.id,
            sharePrice: 30,
          });
        } else {
          setShareOption({
            code: '',
            sharePrice: 0,
          });
        }
      }
    };

    // 添加一个标志防止重复请求
    let isMounted = true;
    
    const checkPayment = async () => {
      if (status === 'authenticated' && session && isMounted) {
        try {
          const result = await checkUserPayment(session.user.id);
          console.log(result.data);
          if (result.data && result.data.hasPaid) {
            setPaymentStatus('success');
            setPaymentResult({
              transactionId: result.data.transactionId ?? '',
              paidAt: new Date(result.data.created_time).toLocaleString(),
            });

            // 使用新的商品查找方式
            const order = goods.find(
              (item) => item.key === result.data.orderType
            ) || {
              description: '',
              name: '',
            };

            console.log(order);

            setOrderInfo((prevState) => ({
              ...prevState,
              orderId: result.data.orderId ?? '',
              created_time: new Date(result.data.created_time).toLocaleString(),
              amount: result.data.price * 100,
              name: result.data.name ?? '',
              orderType: result.data.orderType ?? '',
              description: order.description,
              shareId: result.data.promoter ?? '',
            }));
          } else {
            setPaymentStatus('pending');
          }
          if (shareCode && result.data && !result.data.hasPaid) {
            getShare();
          }

          setIsLoading(false);
        } catch (error) {
          console.error('检查支付状态失败:', error);
          setPaymentStatus('failed');
          setIsLoading(false);
        }
      }
    };
    
    if (status === 'authenticated' && session) {
      checkPayment();
    }
    
    return () => {
      isMounted = false;
    };
  }, [status, session]);

  useEffect(() => {
    if (shareOption && shareOption.code && !initialized.current) {
      initialized.current = true;
      toast.success('检测为合格优惠链接，获得优惠');
      setOrderInfo((prevState) => ({
        ...prevState,
        amount: orderInfo.amount - shareOption.sharePrice * 100,
        shareId: shareOption.code,
      }));
    }
  }, [shareOption]);

  useEffect(() => {
    setOrderInfo((prevState) => ({
      ...prevState,
      orderId: `ORDER_${Date.now()}`,
    }));
  }, []);

  useEffect(() => {
    // 检测是否为移动设备
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        window.navigator.userAgent
      );
    setIsH5Browser(isMobile);
  }, []);

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

    const order = {
      identifier: session?.user.id,
      created_time: new Date(result.paidAt),
      transactionId: result.transactionId,
      orderId: orderInfo.orderId,
      orderType: good.key,
      price: orderInfo.amount / 100,
      name: good.name,
      promoter: shareOption.code,
      promotionPrice: shareOption.sharePrice,
    };

    await createOrder(order);
  };

  const handleCreateOrder = async (order: any) => {
    if (payType === 'yungou') {
      await createPayOrder({
        identifier: order.orderId,
        status: 'pending',
        orderType: good.key,
        price: orderInfo.amount / 100,
        sign: order.sign,
      });
    }
    setOrderInfo((prevState) => ({
      ...prevState,
      ...order,
    }));
  };

  const initiatePayment = () => {
    if (!payType) {
      toast.error('请选择支付方式');
      return;
    }
    setOrderCreated(true);
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64 w-full">
      <div className="animate-bounce">
        <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
          </div>
        </div>
        <div className="text-center mt-4 text-blue-500 font-bold">
          加载中...
        </div>
      </div>
    </div>
  );

  const renderPaymentMethods = () => {
    if (availablePayments.length <= 0) {
      return <p className="text-red-500">暂无可用支付方式</p>;
    }

    return (
      <div className="w-full">
        <div className="flex flex-col gap-3 w-full">
          {availablePayments.map((payment) => (
            <div
              key={payment.key}
              className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-all ${
                payType === payment.key
                  ? 'border-blue-500 ring-2 ring-blue-100 bg-gradient-to-r from-blue-50 to-sky-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
              onClick={() => setPayType(payment.key)}
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                {payType === payment.key && (
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full"></div>
                )}
              </div>
              <Image 
                src={payment.icon} 
                alt={payment.name} 
                width={30} 
                height={30} 
                className="flex-shrink-0"
              />
              <span className="font-medium">{payment.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRightContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (paymentStatus === 'success') {
      return (
        <div className="mt-4 md:mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg shadow-md p-4 md:p-6 w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-emerald-800 text-center">
            支付成功
          </h3>
          <div className="mb-2">
            <span className="font-semibold text-emerald-700">交易号：</span>
            <span className="text-emerald-600">
              {paymentResult.transactionId}
            </span>
          </div>
          <div className="mb-2">
            <div className="font-semibold text-emerald-700 mb-2">客服微信：</div>
            <span className="text-emerald-600">
              <img
                className="w-28 md:w-36"
                src="/payment/wechat.jpg"
                alt=""
                srcSet=""
              />
            </span>
          </div>
          <div className="text-gray-500 text-sm md:text-base">
            添加客服微信获取模板
          </div>

          <div className="mt-8">
            <Link href="/dashboard/order" className="inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-md transition-all">
              前往个人页面
            </Link>
          </div>
        </div>
      );
    }

    if (paymentStatus === 'pending') {
      if (orderCreated) {
        if (isH5Browser) {
          return (
            <WeChatMobilePay
              amount={orderInfo.amount}
              description={good.name}
              orderId={orderInfo.orderId}
              onPaymentSuccess={handlePaymentSuccess}
            />
          );
        }
        return (
          <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <WeChatPcPay
              orderId={orderInfo.orderId}
              payType={payType}
              amount={orderInfo.amount}
              description={good.name}
              onPaymentSuccess={handlePaymentSuccess}
              onCreateOrder={handleCreateOrder}
            />
          </div>
        );
      } else {
        return (
          <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-800">选择支付方式</h3>
            {renderPaymentMethods()}
            <button
              onClick={initiatePayment}
              className="mt-8 w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-medium rounded-md transition-all shadow-md hover:shadow-lg"
            >
              确认支付 ¥{(orderInfo.amount / 100).toFixed(2)}
            </button>
          </div>
        );
      }
    }

    if (paymentStatus === 'failed') {
      return (
        <div className="bg-gradient-to-br from-rose-50 to-red-50 p-6 rounded-lg shadow-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-red-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-rose-800 text-center">
            加载失败
          </h3>
          <p className="text-rose-600 text-center mb-6">请刷新页面重试</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-medium rounded-md transition-all"
          >
            刷新页面
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex justify-center items-center py-8 px-4 md:px-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* 左侧订单信息 */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-sky-700 text-white p-8 md:p-12">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回首页
            </Link>
          </div>
          
          <div className="flex items-center mb-6">
            <img src="/brand/logo.png" alt="Logo" className="w-10 h-10 mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold">订单</h1>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4">商品详情</h2>
            <div className="bg-gradient-to-r from-blue-700/40 to-sky-700/40 backdrop-blur-sm rounded-lg p-4">
              <div className="text-lg font-bold mb-2">{good.name}</div>
              <div className="text-blue-100 mb-4">{good.description}</div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200">单价</span>
                <span className="text-xl font-bold">¥{good.price.toFixed(2)}</span>
              </div>
              
              {shareOption.sharePrice > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-blue-200">优惠</span>
                  <span className="text-emerald-300">-¥{shareOption.sharePrice.toFixed(2)}</span>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-blue-500/30 flex justify-between items-center">
                <span className="text-blue-100">应付总额</span>
                <span className="text-2xl font-bold">¥{(orderInfo.amount / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-blue-200 text-sm">
            {(orderCreated || paymentStatus === 'success') ? (
              <>
                <div className="mb-2">订单号: {orderInfo.orderId}</div>
                <div className="mb-4">创建时间: {orderInfo.created_time || new Date().toLocaleString()}</div>
              </>
            ) : (
              <div className="mb-4 text-blue-100 italic">请选择支付方式并确认支付后生成订单信息</div>
            )}
            <p>请在15分钟内完成支付，否则订单将自动取消。</p>
            <p>如遇到问题，请联系客服wx：13022051583</p>
          </div>
        </div>
        
        {/* 右侧支付区域 */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-white to-slate-50 flex items-center justify-center">
          <div className="w-full max-w-md">
            {renderRightContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

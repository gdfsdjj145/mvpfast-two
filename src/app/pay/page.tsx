'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import { useSession } from 'next-auth/react';
import { config } from '@/config';
import { createOrder, checkUserPayment } from './actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

// 动态导入 WeChatPayQRCode 组件
const WeChatPayQRCode = dynamic(() => import('@/components/PayQrcode'), {
  loading: () => <p>加载支付二维码...</p>,
  ssr: false,
});

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const goodKey = searchParams.get('key');
  const shareCode = searchParams.get('sharecode');

  const good = config.goods.filter((good) => good.key === goodKey)[0];
  const [orderInfo, setOrderInfo] = useState({
    orderId: 'xxxxxxxxx',
    amount: good.price * 100,
    description: good.description,
    createdAt: '',
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

  useEffect(() => {
    const checkPayment = async () => {
      if (status === 'authenticated' && session) {
        try {
          const result = await checkUserPayment(session.user.id);
          if (result.data.hasPaid) {
            setPaymentStatus('success');
            setPaymentResult({
              transactionId: result.data.transactionId,
              paidAt: new Date(result.data.createdAt).toLocaleString(),
            });
            const order = config.goods.filter(
              (good) => good.key === result.data.orderType
            )[0];

            setOrderInfo((prevState) => ({
              ...prevState,
              orderId: result.data.orderId,
              createdAt: new Date(result.data.createdAt).toLocaleString(),
              amount: result.data.price * 100,
              name: result.data.name,
              orderType: result.data.orderType,
              description: order.description,
              shareId: result.data.promoter,
            }));
          } else {
            setPaymentStatus('pending');
          }
          setIsLoading(false);
        } catch (error) {
          console.error('检查支付状态失败:', error);
          setPaymentStatus('failed');
          setIsLoading(false);
        }
      }
    };

    const getShare = () => {
      if (status === 'authenticated' && session) {
        const option = config.shareCode.filter(
          (item) => item.code === shareCode
        )[0] || {
          code: '',
          sharePrice: 0,
        };
        setShareOption(option);
      }
    };

    if (shareCode) {
      getShare();
    }
    checkPayment();
  }, [status, session]);

  useEffect(() => {
    if (shareOption && shareOption.code) {
      toast.success('检测为合格优惠链接，获得优惠');
      setOrderInfo((prevState) => ({
        ...prevState,
        amount: orderInfo.amount - shareOption.sharePrice * 100,
        shareId: shareOption.code,
      }));
    }
  }, [shareOption]);

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
      createdAt: new Date(result.paidAt),
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

  const handleCreateOrder = (order: any) => {
    setOrderInfo((prevState) => ({
      ...prevState,
      ...order,
    }));
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64 w-full">
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
        <div className="mt-4 md:mt-6 bg-green-50 rounded-lg shadow-md p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-green-800">
            支付成功
          </h3>
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
            <div className="font-semibold text-green-700 mb-2">客服微信：</div>
            <span className="text-green-600">
              <img
                className="w-28 md:w-36"
                src="/wechat.jpg"
                alt=""
                srcSet=""
              />
            </span>
          </div>
          <div className="text-gray-500 text-sm md:text-base">
            添加客服微信获取模板
          </div>

          <div className="mt-8">
            <Link href="/dashboard/order" className="btn btn-primary w-full">
              前往个人页面
            </Link>
          </div>
        </div>
      );
    }

    if (paymentStatus === 'pending') {
      return (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <WeChatPayQRCode
            amount={orderInfo.amount}
            description={good.name}
            onPaymentSuccess={handlePaymentSuccess}
            onCreateOrder={handleCreateOrder}
          />
        </div>
      );
    }

    if (paymentStatus === 'failed') {
      return <p>加载失败，请刷新页面重试</p>;
    }
  };

  return (
    <div className="flex justify-center items-center p-4 md:p-8 bg-[#ffffff] min-h-screen">
      <div className="flex flex-col md:flex-row flex-1 w-full max-w-[1200px] bg-white rounded-[20px] shadow-xl relative">
        <Link
          href="/"
          className="max-lg:hidden absolute flex text-xl bg-black text-white py-2 px-4 -top-8 rounded-tl-3xl rounded-tr-3xl cursor-pointer group"
        >
          <div className=" group-hover:scale-105 group-hover:-rotate-12 group-hover:mr-1 transition-all ">
            👈
          </div>
          <div>返回</div>
        </Link>
        {/* 左侧支付表单 */}
        <div className="w-full md:w-[55%] p-6 md:p-12 bg-white">
          <div className="flex justify-between">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
              <img
                src="/logo.png"
                alt=""
                className="w-10 h-10 md:w-12 md:h-12"
              />
              <span>订单详情</span>
            </h1>
            <div className="max-lg:block hidden">
              <Link href="/" className="btn">
                返回
              </Link>
            </div>
          </div>
          <p className="text-[#575757] text-base md:text-lg mb-6 md:mb-8">
            以下是订单的详细内容，请认真核对！
          </p>
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <label className="text-[#575757] text-lg md:text-xl font-bold">
                订单号
              </label>
              <div>{orderInfo.orderId}</div>
            </div>

            <div className="space-y-2">
              <label className="text-[#575757] text-lg md:text-xl font-bold">
                商品描述
              </label>
              <div>{orderInfo.description}</div>
            </div>

            <div className="space-y-2">
              <label className="text-[#575757] text-lg md:text-xl font-bold">
                支付金额
              </label>
              <div>￥{(orderInfo.amount / 100).toFixed(2)}</div>
            </div>

            <div className="space-y-2">
              <label className="text-[#575757] text-lg md:text-xl font-bold">
                创建时间
              </label>
              <div>{orderInfo.createdAt}</div>
            </div>

            <div className="mt-4 md:mt-6 text-xs md:text-sm text-gray-500">
              <p>请在15分钟内完成支付，否则订单将自动取消。</p>
              <p>如遇到问题，请联系客服wx：13022051583</p>
            </div>
          </div>
        </div>

        {/* 右侧订单摘要 */}
        <div className="flex flex-col w-full md:w-[45%] items-center justify-center bg-[#f8f8f8] p-6 md:p-12 relative overflow-hidden">
          <div className="w-full p-4 md:p-8 flex flex-col items-center justify-center">
            {renderRightContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import { useSession } from 'next-auth/react';
import { config } from '@/config';
import {
  createOrder,
  checkUserPayment,
  checkUserById,
  createPayOrder,
  getUserCreditsInfo,
  purchaseWithCredits,
} from './actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useMessages, useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchPublicConfigs, selectPaymentMethods, selectPublicConfigLoaded } from '@/store/publicConfig';

// 动态导入 WeChatPayQRCode 组件
const WeChatPcPay = dynamic(() => import('@/components/weChat/WeChatPcPay'), {
  loading: () => <p>...</p>,
  ssr: false,
});

const WeChatMobilePay = dynamic(
  () => import('@/components/weChat/WeChatMobilePay'),
  {
    loading: () => <p>...</p>,
    ssr: false,
  }
);

// 支付方式类型
interface PaymentMethod {
  key: string;
  name: string;
  icon: string;
  use: boolean;
}

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const goodKey = searchParams.get('key');
  const shareCode = searchParams.get('sharecode');
  const initialized = useRef(false);
  const t = useTranslations('Pay');

  // Redux: 获取支付方式配置
  const dispatch = useAppDispatch();
  const paymentMethods = useAppSelector(selectPaymentMethods);
  const configLoaded = useAppSelector(selectPublicConfigLoaded);

  useEffect(() => {
    dispatch(fetchPublicConfigs());
  }, [dispatch]);

  const availablePayments = useMemo(
    () => (paymentMethods as PaymentMethod[]).filter((p) => p.use),
    [paymentMethods]
  );

  // 获取购买模式配置
  const purchaseMode = config.purchaseMode;

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
    creditPrice: 0,
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
    shareCredits: 0, // 积分模式的优惠积分
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

  // 积分模式相关状态
  const [userCredits, setUserCredits] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // 计算积分模式下的实际消费积分（扣除优惠）
  const requiredCredits = Math.max(0, (good.creditPrice || 0) - shareOption.shareCredits);

  // 获取用户积分（积分模式下）
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (purchaseMode === 'credits' && status === 'authenticated' && session?.user?.id) {
        const result = await getUserCreditsInfo(session.user.id);
        if (result.code === 0) {
          setUserCredits(result.data.credits);
        }
      }
    };
    fetchUserCredits();
  }, [purchaseMode, status, session]);

  useEffect(() => {
    const getShare = async () => {
      if (status === 'authenticated' && session) {
        const { data } = await checkUserById(shareCode ?? '');
        if (data) {
          setShareOption({
            code: data.id,
            sharePrice: 30,
            shareCredits: 5, // 积分模式优惠
          });
        } else {
          setShareOption({
            code: '',
            sharePrice: 0,
            shareCredits: 0,
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
      toast.success(t('validDiscount'));
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

  // 单次购买模式：支付成功回调
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

  // 积分购买模式：使用积分购买
  const handleCreditsPurchase = async () => {
    if (!session?.user?.id) {
      toast.error(t('loginFirst'));
      return;
    }

    if (userCredits < requiredCredits) {
      toast.error(t('insufficientBalance', { current: userCredits, required: requiredCredits }));
      return;
    }

    setIsPurchasing(true);
    try {
      const result = await purchaseWithCredits({
        userId: session.user.id,
        productKey: good.key,
        productName: good.name,
        creditAmount: requiredCredits,
        promoter: shareOption.code || undefined,
        promotionCredits: shareOption.shareCredits,
      });

      if (result.code === 0) {
        setPaymentStatus('success');
        setPaymentResult({
          transactionId: result.data?.orderId || '',
          paidAt: new Date().toLocaleString(),
        });
        setUserCredits(result.data?.remainingCredits || 0);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success(t('purchaseSuccess') + '!');
      } else {
        toast.error(result.message || t('purchaseFailed'));
      }
    } catch (error: any) {
      console.error('积分购买失败:', error);
      toast.error(error.message || t('purchaseFailedRetry'));
    } finally {
      setIsPurchasing(false);
    }
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
      toast.error(t('selectPaymentFirst'));
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
          {t('loading')}
        </div>
      </div>
    </div>
  );

  // 渲染支付方式选择（单次购买模式）
  const renderPaymentMethods = () => {
    if (availablePayments.length <= 0) {
      return <p className="text-red-500">{t('noPaymentMethods')}</p>;
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

  // 渲染积分支付界面（积分购买模式）
  const renderCreditsPayment = () => {
    const hasEnoughCredits = userCredits >= requiredCredits;

    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full">
        <h3 className="text-xl font-bold mb-6 text-gray-800">{t('creditsPayment')}</h3>

        {/* 用户积分余额 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{t('currentBalance')}</span>
            <span className="text-2xl font-bold text-amber-600">{userCredits}</span>
          </div>
        </div>

        {/* 消费详情 */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-gray-600">
            <span>{t('productCreditsPrice')}</span>
            <span className="font-medium">{good.creditPrice || 0} {t('credits')}</span>
          </div>
          {shareOption.shareCredits > 0 && (
            <div className="flex justify-between items-center text-emerald-600">
              <span>{t('discountReduction')}</span>
              <span className="font-medium">-{shareOption.shareCredits} {t('credits')}</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-semibold text-gray-800">{t('amountToPay')}</span>
            <span className="text-xl font-bold text-blue-600">{requiredCredits} {t('credits')}</span>
          </div>
        </div>

        {/* 积分不足提示 */}
        {!hasEnoughCredits && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{t('insufficientCredits')}</span>
            </div>
            <p className="text-sm text-rose-500">
              {t('needMore', { amount: requiredCredits - userCredits })}
            </p>
            <Link
              href="/pay?key=credits"
              className="mt-3 inline-block text-sm text-rose-600 hover:text-rose-700 underline"
            >
              {t('goRecharge')}
            </Link>
          </div>
        )}

        {/* 支付按钮 */}
        <button
          onClick={handleCreditsPurchase}
          disabled={!hasEnoughCredits || isPurchasing}
          className={`w-full py-3 px-4 font-medium rounded-md transition-all shadow-md hover:shadow-lg ${
            hasEnoughCredits && !isPurchasing
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isPurchasing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('processing')}
            </span>
          ) : hasEnoughCredits ? (
            t('confirmCreditsPayment', { amount: requiredCredits })
          ) : (
            t('insufficientCredits')
          )}
        </button>
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
            {purchaseMode === 'credits' ? t('purchaseSuccess') : t('paymentSuccess')}
          </h3>
          <div className="mb-2">
            <span className="font-semibold text-emerald-700">{t('transactionId')}</span>
            <span className="text-emerald-600">
              {paymentResult.transactionId}
            </span>
          </div>
          <div className="mb-2">
            <div className="font-semibold text-emerald-700 mb-2">{t('serviceWechat')}</div>
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
            {t('addWechatForTemplate')}
          </div>

          <div className="mt-8">
            <Link href="/dashboard/order" className="inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-md transition-all">
              {t('goToProfile')}
            </Link>
          </div>
        </div>
      );
    }

    if (paymentStatus === 'pending') {
      // 积分购买模式
      if (purchaseMode === 'credits') {
        return renderCreditsPayment();
      }

      // 单次购买模式
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
            <h3 className="text-xl font-bold mb-6 text-gray-800">{t('selectPaymentMethod')}</h3>
            {renderPaymentMethods()}
            <button
              onClick={initiatePayment}
              className="mt-8 w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-medium rounded-md transition-all shadow-md hover:shadow-lg"
            >
              {t('confirmPayment', { amount: (orderInfo.amount / 100).toFixed(2) })}
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
            {t('loadFailed')}
          </h3>
          <p className="text-rose-600 text-center mb-6">{t('refreshRetry')}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-medium rounded-md transition-all"
          >
            {t('refreshPage')}
          </button>
        </div>
      );
    }
  };

  // 根据购买模式渲染左侧价格信息
  const renderPriceInfo = () => {
    if (purchaseMode === 'credits') {
      return (
        <>
          <div className="flex justify-between items-center">
            <span className="text-blue-200">{t('creditsPrice')}</span>
            <span className="text-xl font-bold">{good.creditPrice || 0} {t('credits')}</span>
          </div>

          {shareOption.shareCredits > 0 && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-blue-200">{t('discount')}</span>
              <span className="text-emerald-300">-{shareOption.shareCredits} {t('credits')}</span>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-blue-500/30 flex justify-between items-center">
            <span className="text-blue-100">{t('totalAmount')}</span>
            <span className="text-2xl font-bold">{requiredCredits} {t('credits')}</span>
          </div>
        </>
      );
    }

    // 单次购买模式
    return (
      <>
        <div className="flex justify-between items-center">
          <span className="text-blue-200">{t('unitPrice')}</span>
          <span className="text-xl font-bold">¥{good.price.toFixed(2)}</span>
        </div>

        {shareOption.sharePrice > 0 && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-blue-200">{t('discount')}</span>
            <span className="text-emerald-300">-¥{shareOption.sharePrice.toFixed(2)}</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-blue-500/30 flex justify-between items-center">
          <span className="text-blue-100">{t('totalAmount')}</span>
          <span className="text-2xl font-bold">¥{(orderInfo.amount / 100).toFixed(2)}</span>
        </div>
      </>
    );
  };

  return (
    <div className="flex justify-center items-center py-8 px-4 md:px-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* 左侧订单信息 */}
        <div className={`w-full md:w-1/2 text-white p-8 md:p-12 ${
          purchaseMode === 'credits'
            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
            : 'bg-gradient-to-br from-blue-600 to-sky-700'
        }`}>
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('backToHome')}
            </Link>
          </div>

          <div className="flex items-center mb-6">
            <img src="/brand/logo.png" alt="Logo" className="w-10 h-10 mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold">{t('order')}</h1>
          </div>

          {/* 购买模式标识 */}
          {purchaseMode === 'credits' && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {t('creditsMode')}
              </span>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4">{t('productDetails')}</h2>
            <div className={`backdrop-blur-sm rounded-lg p-4 ${
              purchaseMode === 'credits'
                ? 'bg-gradient-to-r from-amber-600/40 to-orange-600/40'
                : 'bg-gradient-to-r from-blue-700/40 to-sky-700/40'
            }`}>
              <div className="text-lg font-bold mb-2">{good.name}</div>
              <div className={`mb-4 ${purchaseMode === 'credits' ? 'text-amber-100' : 'text-blue-100'}`}>
                {good.description}
              </div>
              {renderPriceInfo()}
            </div>
          </div>

          <div className={`text-sm ${purchaseMode === 'credits' ? 'text-amber-200' : 'text-blue-200'}`}>
            {(orderCreated || paymentStatus === 'success') ? (
              <>
                <div className="mb-2">{t('orderId', { id: orderInfo.orderId })}</div>
                <div className="mb-4">{t('createTime', { time: orderInfo.created_time || new Date().toLocaleString() })}</div>
              </>
            ) : (
              <div className={`mb-4 italic ${purchaseMode === 'credits' ? 'text-amber-100' : 'text-blue-100'}`}>
                {purchaseMode === 'credits'
                  ? t('pendingCreditsOrder')
                  : t('pendingDirectOrder')}
              </div>
            )}
            {purchaseMode === 'direct' && (
              <p>{t('paymentTimeout')}</p>
            )}
            <p>{t('contactService')}</p>
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

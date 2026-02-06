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
} from './actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useMessages, useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchPublicConfigs, selectPaymentMethods, selectPublicConfigLoaded } from '@/store/publicConfig';

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

  const purchaseMode = config.purchaseMode;

  const messages = useMessages();
  const priceConfig = messages.Price as any;
  const goodsObj = priceConfig.goods;
  const goods = Object.keys(goodsObj).map((key) => ({
    ...goodsObj[key],
    key,
  }));

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
    shareCredits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentResult, setPaymentResult] = useState({
    transactionId: '',
    paidAt: '',
  });

  const [payType, setPayType] = useState('');
  const [isH5Browser, setIsH5Browser] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

<<<<<<< HEAD
  // 如果只有一个支付方式，自动选中
  useEffect(() => {
    if (availablePayments.length === 1 && !payType) {
      setPayType(availablePayments[0].key);
    }
  }, [availablePayments, payType]);

=======
>>>>>>> upstream/feature/2.0
  useEffect(() => {
    const getShare = async () => {
      if (status === 'authenticated' && session) {
        const { data } = await checkUserById(shareCode ?? '');
        if (data) {
          setShareOption({
            code: data.id,
            sharePrice: 30,
            shareCredits: 5,
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

    let isMounted = true;

    const checkPayment = async () => {
      if (status === 'authenticated' && session && isMounted) {
        try {
          // 积分模式允许重复购买，不检查历史订单
          if (purchaseMode === 'credits') {
            setPaymentStatus('pending');
            if (shareCode) {
              getShare();
            }
            setIsLoading(false);
            return;
          }

          const result = await checkUserPayment(session.user.id);
          console.log(result.data);
          if (result.data && result.data.hasPaid) {
            setPaymentStatus('success');
            setPaymentResult({
              transactionId: result.data.transactionId ?? '',
              paidAt: new Date(result.data.created_time).toLocaleString(),
            });

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

    const order: any = {
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

    if (purchaseMode === 'credits') {
      order.orderType = 'credit';
      order.creditAmount = good.creditPrice || 0;
    }

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
      toast.error(t('selectPaymentFirst'));
      return;
    }
    setOrderCreated(true);
  };

  // ==========================================
  // 渲染：加载中
  // ==========================================
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="mt-4 text-base-content/60 text-sm">{t('loading')}</p>
    </div>
  );

  // ==========================================
  // 渲染：支付方式选择
  // ==========================================
  const renderPaymentMethods = () => {
    if (!configLoaded) {
      return (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-md text-primary"></span>
        </div>
      );
    }

    if (availablePayments.length <= 0) {
      return (
        <div role="alert" className="alert alert-error alert-soft">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{t('noPaymentMethods')}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {availablePayments.map((payment) => (
          <label
            key={payment.key}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              payType === payment.key
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-base-200 hover:border-primary/30 hover:bg-base-200/50'
            }`}
            onClick={() => setPayType(payment.key)}
          >
            <input
              type="radio"
              name="payType"
              className="radio radio-primary radio-sm"
              checked={payType === payment.key}
              onChange={() => setPayType(payment.key)}
            />
            <Image
              src={payment.icon}
              alt={payment.name}
              width={28}
              height={28}
              className="shrink-0"
            />
            <span className="font-medium text-base-content">{payment.name}</span>
          </label>
        ))}
      </div>
    );
  };

  // ==========================================
  // 渲染：右侧内容
  // ==========================================
  const renderRightContent = () => {
    if (isLoading) {
      return renderLoading();
    }

    // 支付成功
    if (paymentStatus === 'success') {
      return (
        <div className="card bg-success/5 border border-success/20">
          <div className="card-body items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-success">
              {purchaseMode === 'credits' ? t('purchaseSuccess') : t('paymentSuccess')}
            </h3>

            <div className="w-full space-y-3 text-sm text-left">
              <div className="flex justify-between py-2 border-b border-base-200">
                <span className="text-base-content/60">{t('transactionId')}</span>
                <span className="font-mono text-base-content/80 text-xs max-w-[180px] truncate">
                  {paymentResult.transactionId}
                </span>
              </div>
            </div>

            <div className="divider text-xs text-base-content/40 my-1">{t('serviceWechat')}</div>

            <figure className="rounded-xl overflow-hidden border border-base-200">
              <Image
                src="/payment/wechat.jpg"
                alt="WeChat"
                width={128}
                height={128}
                className="w-28 h-28 object-contain"
              />
            </figure>
            <p className="text-xs text-base-content/50">{t('addWechatForTemplate')}</p>

            <Link href="/dashboard/my-orders" className="btn btn-success btn-block rounded-xl mt-2">
              {t('goToProfile')}
            </Link>
          </div>
        </div>
      );
    }

    // 待支付
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
          <div className="card bg-base-100 border border-base-200">
            <div className="card-body">
              <WeChatPcPay
                orderId={orderInfo.orderId}
                payType={payType}
                amount={orderInfo.amount}
                description={good.name}
                onPaymentSuccess={handlePaymentSuccess}
                onCreateOrder={handleCreateOrder}
              />
            </div>
          </div>
        );
      }

      return (
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body gap-5">
            <h3 className="card-title text-lg">{t('selectPaymentMethod')}</h3>
            {renderPaymentMethods()}
            <button
              onClick={initiatePayment}
              className="btn btn-primary btn-block rounded-xl mt-2 text-base"
            >
              <Image src="/payment/wechat-pay.png" alt="pay" width={20} height={20} className="brightness-0 invert" />
              {t('confirmPayment', { amount: (orderInfo.amount / 100).toFixed(2) })}
            </button>
          </div>
        </div>
      );
    }

    // 加载失败
    if (paymentStatus === 'failed') {
      return (
        <div className="card bg-error/5 border border-error/20">
          <div className="card-body items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-error">{t('loadFailed')}</h3>
            <p className="text-base-content/60 text-sm">{t('refreshRetry')}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-error btn-soft btn-block rounded-xl"
            >
              {t('refreshPage')}
            </button>
          </div>
        </div>
      );
    }
  };

  // ==========================================
  // 渲染：左侧价格信息
  // ==========================================
  const renderPriceInfo = () => {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="opacity-70">{t('unitPrice')}</span>
          <span className="text-lg font-bold">¥{good.price.toFixed(2)}</span>
        </div>

        {purchaseMode === 'credits' && (
          <div className="flex justify-between items-center">
            <span className="opacity-70">{t('creditsPrice')}</span>
            <span className="font-medium">{good.creditPrice || 0} {t('credits')}</span>
          </div>
        )}

        {shareOption.sharePrice > 0 && (
          <div className="flex justify-between items-center text-success">
            <span>{t('discount')}</span>
            <span className="font-medium">-¥{shareOption.sharePrice.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-white/20 pt-3 flex justify-between items-center">
          <span className="font-medium">{t('totalAmount')}</span>
          <span className="text-2xl font-extrabold">¥{(orderInfo.amount / 100).toFixed(2)}</span>
        </div>
      </div>
    );
  };

  // ==========================================
  // 步骤指示器
  // ==========================================
  const currentStep = paymentStatus === 'success' ? 3 : orderCreated ? 2 : 1;

  return (
    <div className="min-h-screen bg-base-200/50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl">
        {/* 步骤条 */}
        <ul className="steps steps-horizontal w-full mb-6">
          <li className={`step ${currentStep >= 1 ? 'step-primary' : ''} text-xs`}>
            {t('productDetails')}
          </li>
          <li className={`step ${currentStep >= 2 ? 'step-primary' : ''} text-xs`}>
            {t('selectPaymentMethod')}
          </li>
          <li className={`step ${currentStep >= 3 ? 'step-primary' : ''} text-xs`}>
            {purchaseMode === 'credits' ? t('purchaseSuccess') : t('paymentSuccess')}
          </li>
        </ul>

        {/* 主内容卡片 */}
        <div className="card bg-base-100 shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* 左侧 — 订单信息 */}
            <div className="lg:w-5/12 bg-gradient-to-br from-primary to-primary/80 text-primary-content p-6 md:p-10">
              {/* 返回首页 */}
              <Link href="/" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('backToHome')}
              </Link>

              {/* 标题 */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <img src="/brand/logo.png" alt="Logo" className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold">{t('order')}</h1>
              </div>

              {/* 购买模式标签 */}
              {purchaseMode === 'credits' && (
                <span className="badge badge-soft badge-sm mb-5 bg-white/15 border-white/20 text-primary-content gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {t('creditsMode')}
                </span>
              )}

              {/* 商品卡片 */}
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-5 mb-6">
                <div className="text-lg font-bold mb-1">{good.name}</div>
                <div className="text-sm opacity-70 mb-5">{good.description}</div>
                {renderPriceInfo()}
              </div>

              {/* 订单信息 */}
              <div className="text-xs opacity-60 space-y-1.5">
                {(orderCreated || paymentStatus === 'success') ? (
                  <>
                    <p>{t('orderId', { id: orderInfo.orderId })}</p>
                    <p>{t('createTime', { time: orderInfo.created_time || new Date().toLocaleString() })}</p>
                  </>
                ) : (
                  <p className="italic opacity-80">
                    {purchaseMode === 'credits'
                      ? t('pendingCreditsOrder')
                      : t('pendingDirectOrder')}
                  </p>
                )}
                {purchaseMode === 'direct' && <p>{t('paymentTimeout')}</p>}
                <p>{t('contactService')}</p>
              </div>
            </div>

            {/* 右侧 — 支付区域 */}
            <div className="lg:w-7/12 p-6 md:p-10 flex items-center justify-center">
              <div className="w-full max-w-md">
                {renderRightContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

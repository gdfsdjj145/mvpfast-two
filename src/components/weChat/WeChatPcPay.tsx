'use client';
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode.react';
import axios from 'axios';
import { paySign } from '@/lib/pay/sign';
import { checkYungouOrderStatus } from '@/app/[local]/pay/actions';

interface WeChatPayQRCodeProps {
  orderId: string;
  amount: number;
  description: string;
  payType: string;
  onPaymentSuccess: (result: { transactionId: string; paidAt: string }) => void;
  onCreateOrder: (order: any) => void;
}

const WeChatPayQRCode: React.FC<WeChatPayQRCodeProps> = ({
  orderId,
  amount,
  payType,
  description,
  onPaymentSuccess,
  onCreateOrder,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [outTradeNo, setOutTradeNo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const createOrderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 创建订单的函数
  const createOrder = async () => {
    try {
      setIsLoading(true);
      let resData = null;
      let sign = '';
      if (payType === 'yungouos') {
        const outTradeNo = `yungouos${new Date().getTime()}`;
        // yungou
        const params = {
          out_trade_no: outTradeNo,
          total_fee: `0.01`, // 修改成为 amount 0.01为测试
          mch_id: process.env.NEXT_PUBLIC_YUNGOUOS_MCH_ID || '',
          body: description,
        };
        sign = paySign(params, process.env.NEXT_PUBLIC_YUNGOUOS_API_KEY || '');
        const { data } = await axios({
          url: 'https://api.pay.yungouos.com/api/pay/wxpay/nativePay',
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: {
            ...params,
            auto: '0',
            sign,
          },
        });
        resData = {
          data: {
            qrCodeUrl: data.data,
            outTradeNo: outTradeNo,
            created_time: new Date().toLocaleString(),
          },
        };
      } else {
        const { data } = await axios.post('/api/wx/create-wechat-order', {
          amount,
          description,
          outTradeNo: orderId,
        });
        resData = data;
      }
      onCreateOrder({
        orderId: resData.data.outTradeNo,
        created_time: resData.data.created_time,
        sign: sign,
      });
      setQrCodeUrl(resData.data.qrCodeUrl);
      setOutTradeNo(resData.data.outTradeNo);
    } catch (err) {
      setError('创建支付订单失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 使用防抖处理 amount 变化
  useEffect(() => {
    // 清除之前的定时器
    if (createOrderTimeoutRef.current) {
      clearTimeout(createOrderTimeoutRef.current);
    }

    // 设置新的定时器，1秒后执行
    createOrderTimeoutRef.current = setTimeout(() => {
      createOrder();
    }, 1000); // 1秒的防抖时间

    // 清理函数
    return () => {
      if (createOrderTimeoutRef.current) {
        clearTimeout(createOrderTimeoutRef.current);
      }
    };
  }, [amount, payType]);

  // 检查订单状态的 useEffect 保持不变
  useEffect(() => {
    if (!outTradeNo || isPaymentSuccessful) return;

    // 检测微信支付订单状态
    const checkOrderStatus = async () => {
      try {
        const { data } = await axios.get(
          `/api/wx/query-wechat-order?outTradeNo=${outTradeNo}`
        );
        if (data.data.trade_state === 'SUCCESS') {
          setPaymentStatus('success');
          setIsPaymentSuccessful(true);
          onPaymentSuccess({
            transactionId: data.data.transaction_id,
            paidAt: new Date(data.data.success_time).toLocaleString(),
          });
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
        }
      } catch (err) {
        console.error('查询订单状态失败:', err);
      }
    };

    // 检测yungou订单状态
    const checkYungouOrderStatusFn = async () => {
      const payOrder = await checkYungouOrderStatus(outTradeNo);
      if (payOrder && payOrder.status === 'success') {
        setPaymentStatus('success');
        setIsPaymentSuccessful(true);
        onPaymentSuccess({
          transactionId: payOrder.sign ?? '',
          paidAt: new Date().toLocaleString(),
        });
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
      }
    };

    if (payType === 'wechat') {
      intervalIdRef.current = setInterval(checkOrderStatus, 5000);
    } else if (payType === 'yungouos') {
      intervalIdRef.current = setInterval(checkYungouOrderStatusFn, 5000);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [outTradeNo, onPaymentSuccess, isPaymentSuccessful]);

  // 组件卸载时清理所有定时器
  useEffect(() => {
    return () => {
      if (createOrderTimeoutRef.current) {
        clearTimeout(createOrderTimeoutRef.current);
      }
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!qrCodeUrl) {
    return <div className="text-red-500">无法生成支付二维码</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">请使用微信扫描二维码支付</h2>
      <div className="relative">
        <QRCode value={qrCodeUrl} size={256} />
        {paymentStatus === 'success' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80">
            <svg
              className="w-16 h-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="mt-4 text-xl font-bold text-green-600">支付成功！</p>
            <p className="mt-2 text-gray-600">感谢您的购买，祝您使用愉快！</p>
          </div>
        )}
      </div>
      <p className="mt-4">金额: ¥{(amount / 100).toFixed(2)}</p>
      <p>描述: {description}</p>
    </div>
  );
};

export default WeChatPayQRCode;

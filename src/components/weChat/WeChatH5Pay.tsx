'use client';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

declare global {
  interface WeixinJSBridge {
    invoke: (api: string, config: any) => void;
  }
}

interface WeChatH5PayProps {
  onClick?: () => void;
  disabled?: boolean;
  amount: number;
  description: string;
  orderId: string;
  onPaymentSuccess: (result: { transactionId: string; paidAt: string }) => void;
}

export default function WeChatH5Pay({
  disabled = false,
  amount,
  description,
  orderId,
  onPaymentSuccess,
}: WeChatH5PayProps) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = React.useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const createOrderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const useWeChatPay = (data: { data: { timestamp: string; nonce: string; package: string; signature: string } }) => {
    (window as any).WeixinJSBridge.invoke(
      'getBrandWCPayRequest',
      {
        appId: process.env.NEXT_PUBLIC_WECHAT_APPID,
        timeStamp: data.data.timestamp,
        nonceStr: data.data.nonce,
        package: data.data.package,
        signType: 'RSA',
        paySign: data.data.signature,
      },
      function (res: { err_msg: string }) {
        console.log(res, '-----');
        if (res.err_msg == 'get_brand_wcpay_request:ok') {
          console.log('支付成功');
          // 使用以上方式判断前端返回,微信团队郑重提示：
          //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠，商户需进一步调用后端查单确认支付结果。
        }
      }
    );
  };

  const handleClick = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/wx/create-wechat-order', {
        description,
        amount,
        userId: session?.user?.wechatOpenId,
        type: 'jsapi',
        outTradeNo: orderId,
      });

      if (data.data.package) {
        // 或者先检查是否存在，再等待事件
        if (typeof (window as any).WeixinJSBridge === 'undefined') {
          console.log('WeixinJSBridge is undefined');
          if (document.addEventListener) {
            document.addEventListener('WeixinJSBridgeReady', () =>
              useWeChatPay(data)
            );
          } else if ((document as any).attachEvent) {
            (document as any).attachEvent('WeixinJSBridgeReady', () =>
              useWeChatPay(data)
            );
            (document as any).attachEvent('onWeixinJSBridgeReady', () =>
              useWeChatPay(data)
            );
          }
        } else {
          console.log('WeixinJSBridge is defined');
          useWeChatPay(data);
        }
      }
    } catch (error) {
      console.error('支付发起失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 检查订单状态的 useEffect 保持不变
  useEffect(() => {
    if (!orderId || isPaymentSuccessful) return;

    // 检测微信支付订单状态
    const checkOrderStatus = async () => {
      try {
        const { data } = await axios.get(
          `/api/wx/query-wechat-order?outTradeNo=${orderId}`
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

    intervalIdRef.current = setInterval(checkOrderStatus, 5000);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [orderId, onPaymentSuccess, isPaymentSuccessful]);

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

  return (
    <div className="w-full">
      {paymentStatus === 'success' ? (
        <div className="text-green-500">支付成功</div>
      ) : (
        <button
          onClick={handleClick}
          disabled={disabled || loading}
          className={`
            w-full
            py-3
            px-4
            bg-[#07C160]
            hover:bg-[#06AE56]
            disabled:bg-[#95E1B5]
            text-white
            font-medium
            rounded-md
            flex
            items-center
            justify-center
            gap-2
            transition-colors
            duration-200
            min-w-full
          `}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.69 20.589a1.364 1.364 0 0 1-.607-.143l-3.404-1.63a.91.91 0 0 1-.5-.547.909.909 0 0 1 .048-.739l.751-1.464c.056-.107.08-.229.07-.35a.416.416 0 0 0-.158-.303c-1.857-1.54-2.961-3.629-2.961-5.608 0-4.345 4.56-7.886 10.166-7.886 5.607 0 10.166 3.54 10.166 7.886 0 4.345-4.56 7.885-10.166 7.885-.592 0-1.188-.04-1.774-.119a.425.425 0 0 0-.302.062l-1.033.785a1.366 1.366 0 0 1-.796.171zM12 3.37c-4.886 0-8.866 3.103-8.866 6.435 0 1.623.96 3.38 2.61 4.707a1.77 1.77 0 0 1 .666 1.276c.04.504-.108.996-.416 1.384l-.276.538 2.424 1.161.725-.55c.524-.398 1.212-.55 1.874-.414.536.072 1.082.109 1.626.109 4.886 0 8.866-3.103 8.866-6.435 0-3.332-3.98-6.435-8.866-6.435z" />
            </svg>
          )}
          微信支付
        </button>
      )}
    </div>
  );
}

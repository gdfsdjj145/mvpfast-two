import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import axios from 'axios';

interface WeChatPayQRCodeProps {
  amount: number;
  description: string;
  onPaymentSuccess: () => void;
}

const WeChatPayQRCode: React.FC<WeChatPayQRCodeProps> = ({
  amount,
  description,
  onPaymentSuccess,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [outTradeNo, setOutTradeNo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const createOrder = async () => {
      try {
        const response = await axios.post('/api/wx/create-wechat-order', {
          amount,
          description,
        });
        console.log(response);
        setQrCodeUrl(response.data.qrCodeUrl);
        setOutTradeNo(response.data.outTradeNo);
      } catch (err) {
        setError('创建支付订单失败');
      } finally {
        setIsLoading(false);
      }
    };

    createOrder();
  }, [amount, description]);

  useEffect(() => {
    if (!outTradeNo) return;

    const checkOrderStatus = async () => {
      try {
        const response = await axios.get(
          `/api/wx/query-wechat-order?outTradeNo=${outTradeNo}`
        );
        if (response.data.trade_state === 'SUCCESS') {
          onPaymentSuccess();
        }
      } catch (err) {
        console.error('查询订单状态失败:', err);
      }
    };

    const intervalId = setInterval(checkOrderStatus, 5000); // 每5秒检查一次

    return () => clearInterval(intervalId);
  }, [outTradeNo, onPaymentSuccess]);

  if (isLoading) {
    return <div>正在生成支付二维码...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!qrCodeUrl) {
    return <div>无法生成支付二维码</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">请使用微信扫描二维码支付</h2>
      <QRCode value={qrCodeUrl} size={256} />
      <p className="mt-4">金额: ¥{(amount / 100).toFixed(2)}</p>
      <p>描述: {description}</p>
    </div>
  );
};

export default WeChatPayQRCode;

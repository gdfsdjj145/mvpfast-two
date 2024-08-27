'use client';

import React from 'react';
import WeChatPayQRCode from '@/components/PayQrcode';

export default function PaymentPage() {
  const handlePaymentSuccess = () => {
    // 处理支付成功后的逻辑
    console.log('支付成功');
    // 可以在这里重定向到成功页面或更新UI
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">支付页面</h1>
      <WeChatPayQRCode
        amount={10000} // 金额（单位：分）
        description="测试商品"
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

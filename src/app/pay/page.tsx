'use client';
import { useState } from 'react';

export default function Home() {
  const [items] = useState([
    { price: 'price_1Hh1j2K2oX8h0T3W0e7D7E6E', quantity: 1 }, // 替换为你的产品价格 ID
  ]);

  const handleCheckout = async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    const data = await response.json();
    if (data.id) {
      const stripe = await getStripe(); // 获取 Stripe 对象
      await stripe.redirectToCheckout({ sessionId: data.id });
    }
  };

  return (
    <div>
      <h1>产品列表</h1>
      <button onClick={handleCheckout}>去结账</button>
    </div>
  );
}

// 获取 Stripe 对象的函数
const getStripe = () => {
  return import('@stripe/stripe-js').then((module) =>
    module.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  );
};

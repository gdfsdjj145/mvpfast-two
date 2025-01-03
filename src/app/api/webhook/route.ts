// pages/api/webhook.js
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// 处理 POST 请求
export async function POST(req: Request) {
  console.log('收到 Stripe Webhook 请求');
  const body = await req.text();
  const sig = headers().get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook 签名验证失败:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // 处理不同的事件
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('支付会话完成:', session);
      break;
    default:
      console.log(`收到未处理的事件类型 ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

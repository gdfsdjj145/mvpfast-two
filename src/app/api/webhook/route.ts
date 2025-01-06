// pages/api/webhook.js
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!);

// 为了本地测试，我们需要使用不同的 secret
const endpointSecret =
  process.env.NODE_ENV === 'development'
    ? process.env.STRIPE_WEBHOOK_SECRET_CLI // CLI 提供的 secret
    : process.env.STRIPE_WEBHOOK_SECRET; // 生产环境的 secret

// 处理 POST 请求
export async function POST(req: Request) {
  console.log('收到 Stripe Webhook 请求');
  const body = await req.text();
  const sig = headers().get('stripe-signature');

  console.log('Webhook Secret:', endpointSecret); // 不要在生产环境打印
  console.log('Signature:', sig); // 不要在生产环境打印

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret!);
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
      const session = event.data.object as Stripe.Checkout.Session;

      // 确认支付状态
      if (session.payment_status === 'paid') {
        // 获取订单相关信息
        const customerId = session.customer;
        const paymentIntentId = session.payment_intent;
        const amountTotal = session.amount_total;
        const metadata = session.metadata; // 如果在创建支付时设置了metadata

        console.log('支付成功:', {
          customerId,
          paymentIntentId,
          amountTotal,
          metadata,
        });

        // 更新订单状态
        await prisma.order.create({
          data: {
            identifier: metadata.orderId,
            orderId: metadata.orderId,
            transactionId: paymentIntentId,
            price: amountTotal,
          },
        });

        // TODO: 在这里更新您的数据库
        // 1. 更新订单状态
        // 2. 发送邮件通知
        // 3. 更新用户权限等
      }
      break;
  }

  return NextResponse.json({ received: true });
}

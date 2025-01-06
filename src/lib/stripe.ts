import { config } from '@/config';

export async function createCheckoutSession(key: string, id: string) {
  const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

  const good = config.goods.find((item) => item.key === key);

  console.log(good);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'], // 支持的支付方式
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: good.name, // 商品名称
          },
          unit_amount: good.price * 100, // 商品价格（单位是分，如 $20.00 = 2000）
        },
        quantity: 1, // 商品数量
      },
    ],
    mode: 'payment', // 支付模式
    success_url:
      'https://yourwebsite.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://yourwebsite.com/cancel',
    metadata: {
      userId: id, // 自定义用户 ID 参数
      goodType: good.key,
      goodPrice: good.price,
      custom_info: 'any_custom_data', // 其他自定义信息
    },
    client_reference_id: 'user-12345', // Stripe 内置的用户唯一标识符字段（可选）
  });

  console.log('Checkout Session URL:', session.url);
  return session.url;
}

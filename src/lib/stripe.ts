import { config } from '@/config';

export async function createCheckoutSession(key: string, id: string) {
  if (!id) {
    window.location.href = '/auth/signin';
    return;
  }

  const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

  const good = config.goods.find((item) => item.key === key);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'], // 支持的支付方式
    line_items: [
      {
        price_data: {
          currency: config.paySize,
          product_data: {
            name: good.name, // 商品名称
          },
          unit_amount: good.price * 100, // 商品价格（单位是分，如 $20.00 = 2000）
        },
        quantity: 1, // 商品数量
      },
    ],
    mode: 'payment', // 支付模式
    success_url: `${window.location.origin}/dashboard/home`,
    cancel_url: `${window.location.origin}/`,
    metadata: {
      userId: id, // 自定义用户 ID 参数
      goodType: good.key,
      goodPrice: good.price,
      goodName: good.name,
      custom_info: 'any_custom_data', // 其他自定义信息
    },
  });

  return session.url;
}

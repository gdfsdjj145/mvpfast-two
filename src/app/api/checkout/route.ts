// pages/api/checkout.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // 使用你的 Stripe Secret Key

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: req.body.items, // 从请求中获取商品信息
        mode: 'payment',
        success_url: `${req.headers.origin}/success`, // 成功后的重定向 URL
        cancel_url: `${req.headers.origin}/cancel`, // 取消后的重定向 URL
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

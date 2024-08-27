import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOrder } from '@/lib/pay';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const { outTradeNo } = req.query;

  if (!outTradeNo || typeof outTradeNo !== 'string') {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  try {
    const result = await queryOrder(outTradeNo);
    res.status(200).json(result);
  } catch (error) {
    console.error('查询微信支付订单失败:', error);
    res.status(500).json({ error: '查询支付订单失败' });
  }
}

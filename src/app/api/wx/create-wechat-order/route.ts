import { createNativeOrder } from '@/lib/pay';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { amount, description } = body;

  if (!amount || !description) {
    return NextResponse.json(
      {
        data: {},
        msg: '缺少必要参数',
      },
      { status: 400 }
    );
  }
  try {
    const outTradeNo = `ORDER_${Date.now()}`; // 生成唯一订单号
    const result = await createNativeOrder({
      outTradeNo,
      description,
      amount,
    });
    console.log(result);
    return NextResponse.json({
      data: {
        qrCodeUrl: result.code_url,
        outTradeNo,
        createdAt: new Date().toLocaleString(),
      },
      msg: '创建微信支付订单成功',
    });
  } catch (error) {
    console.error('创建微信支付订单失败:', error);
    return NextResponse.json(
      {
        data: {},
        msg: '创建微信支付订单失败',
      },
      { status: 500 }
    );
  }
}

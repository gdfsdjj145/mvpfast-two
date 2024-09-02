import { queryOrder } from '@/lib/pay';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const outTradeNo = request.nextUrl.searchParams.get('outTradeNo');

  if (!outTradeNo) {
    return NextResponse.json(
      {
        data: {},
        message: '缺少必要参数',
      },
      { status: 400 }
    );
  }

  try {
    const result = await queryOrder(outTradeNo);
    return NextResponse.json({
      data: result,
      message: '查询微信支付订单成功',
    });
  } catch (error) {
    console.error('查询微信支付订单失败:', error);
    return NextResponse.json({ error: '查询支付订单失败' }, { status: 500 });
  }
}

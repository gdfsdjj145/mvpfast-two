import {
  createNativeOrder,
  createJsapiOrder,
  generateJsapiSignature,
  generateNonce,
  generateTimestamp,
} from '@/lib/pay';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { amount, description, userId, type = 'native', outTradeNo } = body;

  if (!amount || !description) {
    return NextResponse.json(
      {
        data: {},
        message: '缺少必要参数',
      },
      { status: 400 }
    );
  }
  try {
    if (type === 'native') {
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
          created_time: new Date().toLocaleString(),
        },
        message: '创建微信支付订单成功',
      });
    } else if (type === 'jsapi') {
      const result = await createJsapiOrder(
        {
          outTradeNo,
          description,
          amount,
        },
        userId
      );
      const nonce = generateNonce();
      const timestamp = generateTimestamp();
      const packageId = `prepay_id=${result.prepay_id}`;
      const signature = generateJsapiSignature(packageId, timestamp, nonce);
      return NextResponse.json({
        data: {
          ...result,
          signature,
          timestamp,
          nonce,
          package: packageId
        },
      });
    }
  } catch (error) {
    console.error('创建微信支付订单失败:', error);
    return NextResponse.json(
      {
        data: {},
        message: '创建微信支付订单失败',
      },
      { status: 500 }
    );
  }
}

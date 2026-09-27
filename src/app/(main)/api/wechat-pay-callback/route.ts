import { NextRequest, NextResponse } from 'next/server';
import {
  decryptWechatPayNotification,
  verifyWechatPayNotification,
  type WechatPayNotification,
} from '@/lib/services/pay/notification';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const verificationKey = process.env.WECHAT_PAY_VERIFY_KEY;
  const verificationSerial = process.env.WECHAT_PAY_VERIFY_SERIAL;
  const apiV3Key = process.env.WECHAT_API_V3_KEY;
  if (!verificationKey || !verificationSerial || !apiV3Key) {
    return NextResponse.json({ code: 'FAIL', message: '微信支付验签尚未配置' }, { status: 503 });
  }

  try {
    const rawBody = await request.text();
    if (rawBody.length > 1024 * 1024 ||
        !verifyWechatPayNotification(request.headers, rawBody, verificationKey, verificationSerial,
          Date.now(), process.env.WECHAT_SERIAL_NO)) {
      return NextResponse.json({ code: 'FAIL', message: '通知签名无效' }, { status: 401 });
    }

    const notification = JSON.parse(rawBody) as WechatPayNotification;
    if (notification.event_type !== 'TRANSACTION.SUCCESS') {
      return new NextResponse(null, { status: 204 });
    }
    if (!notification.resource) {
      return NextResponse.json({ code: 'FAIL', message: '通知内容缺失' }, { status: 400 });
    }

    const transaction = decryptWechatPayNotification(notification.resource, apiV3Key);
    if (transaction.trade_state !== 'SUCCESS' ||
        transaction.appid !== process.env.NEXT_PUBLIC_WECHAT_APPID ||
        transaction.mchid !== process.env.WECHAT_MCHID ||
        transaction.amount?.currency !== 'CNY' ||
        !Number.isSafeInteger(transaction.amount.total) || transaction.amount.total <= 0 ||
        !transaction.out_trade_no || !transaction.transaction_id) {
      return NextResponse.json({ code: 'FAIL', message: '通知订单信息不匹配' }, { status: 400 });
    }

    // 现有订单结算由页面向服务端查单后完成；此处仅确认可信通知。
    // 后续若改为服务端自动履约，应先持久化待支付订单并实现幂等事务。
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[WechatPayCallback] 处理通知失败:', error instanceof Error ? error.message : error);
    return NextResponse.json({ code: 'FAIL', message: '处理通知失败' }, { status: 500 });
  }
}

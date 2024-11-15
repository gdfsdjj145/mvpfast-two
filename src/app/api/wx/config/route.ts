// app/api/wx/config/route.ts
import { NextResponse } from 'next/server';
import {
  generateSignature,
  getJsApiTicket,
  getTokenStatus,
} from '@/lib/wechat';

export async function GET(request: Request) {
  try {
    // 获取当前页面 URL
    const { headers } = request;
    const referer = headers.get('referer') || process.env.NEXT_PUBLIC_SITE_URL;

    // 生成签名所需参数
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = Math.random().toString(36).substr(2, 15);

    // 获取 jsapi_ticket
    const jsapi_ticket = await getJsApiTicket();

    // 生成签名
    const signature = generateSignature({
      noncestr: nonceStr,
      timestamp,
      url: referer,
      jsapi_ticket,
    });

    // 准备返回数据
    const responseData = {
      appId: process.env.WECHAT_APPID,
      timestamp,
      nonceStr,
      signature,
      url: referer,
    };

    // 在开发环境下添加调试信息
    if (process.env.NODE_ENV === 'development') {
      Object.assign(responseData, {
        debug: true,
        tokenStatus: getTokenStatus(),
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('获取微信配置失败:', error);

    // 返回详细的错误信息（仅在开发环境）
    const errorResponse = {
      error: '获取微信配置失败',
      ...(process.env.NODE_ENV === 'development'
        ? { details: error.message }
        : {}),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

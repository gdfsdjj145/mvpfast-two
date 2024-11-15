import { NextResponse } from 'next/server';
import { sign } from 'crypto';
export async function GET() {
  try {
    const redirect_uri = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/wx/callback`
    );
    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${process.env.WECHAT_APPID}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('获取微信登录链接失败', error);
    return NextResponse.error();
  }
}

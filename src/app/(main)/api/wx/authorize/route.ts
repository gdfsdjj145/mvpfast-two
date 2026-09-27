import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'mvpfast.wx.mp_state';

export async function GET(request: NextRequest) {
  const appid = process.env.NEXT_PUBLIC_WECHAT_APPID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!appid || !siteUrl || !process.env.WECHAT_MP_APPSECRET) {
    return NextResponse.json({ error: '微信公众号登录尚未配置' }, { status: 503 });
  }

  const site = new URL(siteUrl);
  if (request.nextUrl.origin !== site.origin) {
    return NextResponse.redirect(new URL('/api/wx/authorize', site));
  }

  const state = `mp_${crypto.randomBytes(24).toString('hex')}`;
  const callback = new URL('/api/wx/callback', site);
  const authorizeUrl = new URL('https://open.weixin.qq.com/connect/oauth2/authorize');
  authorizeUrl.search = new URLSearchParams({
    appid,
    redirect_uri: callback.toString(),
    response_type: 'code',
    scope: 'snsapi_userinfo',
    state,
  }).toString();
  authorizeUrl.hash = 'wechat_redirect';

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: site.protocol === 'https:',
    path: '/',
    maxAge: 5 * 60,
  });
  return response;
}

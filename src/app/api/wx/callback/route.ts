import { NextResponse } from 'next/server';
import { sign } from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      throw new Error('未获取到微信授权码');
    }

    // 使用 code 换取 access_token 和用户信息
    const accessTokenRes = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_APPID}&secret=${process.env.WX_APP_SECRET}&code=${code}&grant_type=authorization_code`
    );

    const accessTokenData = await accessTokenRes.json();

    // 获取用户信息
    const userInfoRes = await fetch(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${accessTokenData.access_token}&openid=${accessTokenData.openid}`
    );

    const userInfo = await userInfoRes.json();

    // 重定向到前端，带上用户信息
    const redirect_uri = `${process.env.NEXT_PUBLIC_SITE_URL}/login?wx_code=${code}&openid=${userInfo.openid}`;
    return NextResponse.redirect(redirect_uri);
  } catch (error) {
    console.error('微信回调处理失败', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=wx_callback_failed`
    );
  }
}

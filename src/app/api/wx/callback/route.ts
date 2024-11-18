import { NextResponse } from 'next/server';
import { sign } from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      throw new Error('未获取到微信授权码');
    }
    console.log(code,'================')
    const redirect_uri = '/'
    return NextResponse.redirect(redirect_uri);
  } catch (error) {
    console.error('微信回调处理失败', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=wx_callback_failed`
    );
  }
}

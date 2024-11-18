export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        {
          data: {},
          message: '未获取到微信授权码',
        },
        { status: 400 }
      );
    }
    console.log(code, '================');
    const redirect_uri = '/';
    return NextResponse.redirect(redirect_uri);
  } catch (error) {
    console.error('微信回调处理失败', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=wx_callback_failed`
    );
  }
}

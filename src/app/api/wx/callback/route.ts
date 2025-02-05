export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

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

    const { data }: any = await axios({
      method: 'post',
      url: `${process.env.NEXT_PUBLIC_API_URL}/auth/wechat`,
      data: {
        code: code,
      },
    });
    const opneid = data.data.openid || '';

    if (!opneid) {
      console.error('微信回调处理失败', opneid);
    } else {
      const redirectUrl = new URL('/auth/signin', request.nextUrl.origin);
      redirectUrl.searchParams.set('id', opneid);
      redirectUrl.searchParams.set('type', 'wxlogin');

      console.log('Redirecting to:', redirectUrl.toString());

      return NextResponse.redirect(redirectUrl, {
        status: 302,
      });
    }

    return NextResponse.json(
      {
        data: {},
        message: '',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('微信回调处理失败', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=wx_callback_failed`
    );
  }
}

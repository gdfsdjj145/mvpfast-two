export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { signIn } from 'next-auth/react';

export async function GET(request: NextRequest) {
  console.log(request, '++++++++++');
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

    const data: any = await axios({
      method: 'post',
      url: `${process.env.NEXT_PUBLIC_API_URL}/auth/wechat`,
      data: {
        code: code,
      },
    });

    const { openid } = data;

    const res: any = await signIn('credentials', {
      type: 'wx',
      identifier: openid,
      redireact: false,
    });
    if (res?.error) {
      console.error('微信回调处理失败', res.error);
    } else {
      return NextResponse.redirect(new URL('/', request.url));
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

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { authenticateCredentials, setAuthCookies } from '@/lib/serverAuth';

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

    const res: any = await authenticateCredentials('credentials', {
      type: 'wx',
      identifier: data.data.openid,
      redireact: false,
      code: '',
    });

    console.log(res, 'res ==============');

    if (!res?.token) {
      console.error('微信回调处理失败', res);
    } else {
      setAuthCookies(res.token);
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

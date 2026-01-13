export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { encode } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { getGeneratorName } from '@/lib/generatorName';

// 微信开放平台接口获取 access_token
async function getWechatOpenAccessToken(code: string) {
  const appid = process.env.WECHAT_OPEN_APPID;
  const secret = process.env.WECHAT_OPEN_APPSECRET;

  const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`;

  const response = await axios.get(url);
  return response.data;
}

// 获取微信用户信息
async function getWechatUserInfo(accessToken: string, openid: string) {
  const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`;

  const response = await axios.get(url);
  return response.data;
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');

    if (!code) {
      return NextResponse.json(
        {
          data: {},
          message: '未获取到微信授权码',
        },
        { status: 400 }
      );
    }

    // 通过 state 参数区分开放平台登录和公众号登录
    // state 以 'open_' 开头表示是微信开放平台登录
    const isOpenPlatform = state?.startsWith('open_');

    if (isOpenPlatform) {
      // 微信开放平台登录流程
      const tokenData = await getWechatOpenAccessToken(code);

      if (tokenData.errcode) {
        console.error('获取微信access_token失败:', tokenData);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin?error=wx_token_failed`
        );
      }

      const { access_token, openid, unionid } = tokenData;

      // 获取用户信息
      const userInfo = await getWechatUserInfo(access_token, openid);

      if (userInfo.errcode) {
        console.error('获取微信用户信息失败:', userInfo);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin?error=wx_userinfo_failed`
        );
      }

      const { nickname, headimgurl } = userInfo;

      // 查找或创建用户
      // 优先通过 unionid 查找，如果没有则通过 openid 查找
      let user = null;

      if (unionid) {
        user = await prisma.user.findFirst({
          where: { wechatUnionId: unionid },
        });
      }

      if (!user) {
        user = await prisma.user.findFirst({
          where: { wechatOpenId: openid },
        });
      }

      if (!user) {
        // 创建新用户
        user = await prisma.user.create({
          data: {
            wechatOpenId: openid,
            wechatUnionId: unionid || null,
            nickName: nickname || getGeneratorName(),
            avatar: headimgurl || null,
            email: null,
            phone: null,
          },
        });
      } else {
        // 更新用户信息（如果有新的 unionid 或头像昵称变更）
        const updateData: {
          wechatUnionId?: string;
          nickName?: string;
          avatar?: string;
        } = {};

        if (unionid && !user.wechatUnionId) {
          updateData.wechatUnionId = unionid;
        }
        if (headimgurl && headimgurl !== user.avatar) {
          updateData.avatar = headimgurl;
        }
        if (nickname && nickname !== user.nickName) {
          updateData.nickName = nickname;
        }

        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
        }
      }

      // 生成 JWT token
      const token = await encode({
        token: {
          sub: user.id,
          email: user.email,
          phone: user.phone,
          wechatOpenId: user.wechatOpenId,
          wechatUnionId: user.wechatUnionId,
          nickName: user.nickName,
          avatar: user.avatar,
        },
        secret: process.env.NEXTAUTH_SECRET!,
        salt: 'next-auth.session-token',
      });

      // 创建响应并设置 cookie
      const redirectUrl = new URL('/', request.nextUrl.origin);
      const response = NextResponse.redirect(redirectUrl);

      // 设置 next-auth session cookie
      response.cookies.set('next-auth.session-token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 2 * 60 * 60, // 2小时，与 auth.ts 中的 session.maxAge 保持一致
      });

      return response;
    } else {
      // 原有的公众号登录流程
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
    }
  } catch (error) {
    console.error('微信回调处理失败', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin?error=wx_callback_failed`
    );
  }
}

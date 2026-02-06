export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import prisma from '@/lib/core/prisma';
import { getGeneratorName } from '@/lib/utils/name-generator';
import { grantInitialCredits } from '@/models/credit';

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
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  console.log('[WxCallback] 收到微信回调, state:', state, ', code:', code ? '有' : '无');

  try {
    if (!code) {
      console.warn('[WxCallback] 缺少授权码 code');
      return NextResponse.json(
        { data: {}, message: '未获取到微信授权码' },
        { status: 400 }
      );
    }

    // 通过 state 参数区分开放平台登录和公众号登录
    const isOpenPlatform = state?.startsWith('open_');
    console.log('[WxCallback] 登录方式:', isOpenPlatform ? '开放平台' : '公众号');

    if (isOpenPlatform) {
      // ========== 微信开放平台登录流程 ==========

      // 1. 获取 access_token
      console.log('[WxCallback] 正在获取微信 access_token...');
      const tokenData = await getWechatOpenAccessToken(code);

      if (tokenData.errcode) {
        console.error('[WxCallback] 获取 access_token 失败:', JSON.stringify(tokenData));
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin?error=wx_token_failed`
        );
      }

      const { access_token, openid, unionid } = tokenData;
      console.log('[WxCallback] access_token 获取成功, openid:', openid, ', unionid:', unionid || '无');

      // 2. 获取用户信息
      console.log('[WxCallback] 正在获取微信用户信息...');
      const userInfo = await getWechatUserInfo(access_token, openid);

      if (userInfo.errcode) {
        console.error('[WxCallback] 获取用户信息失败:', JSON.stringify(userInfo));
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin?error=wx_userinfo_failed`
        );
      }

      const { nickname, headimgurl } = userInfo;
      console.log('[WxCallback] 用户信息获取成功, nickname:', nickname);

      // 3. 查找或创建用户（确保用户存在于数据库中）
      let user = null;
      let isNewUser = false;

      if (unionid) {
        user = await prisma.user.findFirst({
          where: { wechatUnionId: unionid },
        });
        if (user) console.log('[WxCallback] 通过 unionid 找到用户:', user.id);
      }

      if (!user) {
        user = await prisma.user.findFirst({
          where: { wechatOpenId: openid },
        });
        if (user) console.log('[WxCallback] 通过 openid 找到用户:', user.id);
      }

      if (!user) {
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
        isNewUser = true;
        console.log('[WxCallback] 创建新用户:', user.id);
        await grantInitialCredits(user.id);
        console.log('[WxCallback] 已赠送初始积分');
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
          console.log('[WxCallback] 已更新用户信息:', Object.keys(updateData).join(', '));
        }
      }

      // 4. 跳转到 signin 页面，交给 NextAuth 的 signIn() 处理 JWT + Cookie
      const redirectUrl = new URL('/auth/signin', request.nextUrl.origin);
      redirectUrl.searchParams.set('id', openid);
      redirectUrl.searchParams.set('type', 'wxlogin');

      console.log('[WxCallback] 开放平台登录完成, 用户:', user.id, ', isNew:', isNewUser, ', 跳转 signin 页面走 NextAuth 流程');

      return NextResponse.redirect(redirectUrl, { status: 302 });
    } else {
      // ========== 公众号登录流程 ==========
      console.log('[WxCallback] 开始公众号登录流程, 请求外部 API:', `${process.env.NEXT_PUBLIC_API_URL}/auth/wechat`);

      const { data }: any = await axios({
        method: 'post',
        url: `${process.env.NEXT_PUBLIC_API_URL}/auth/wechat`,
        data: { code },
      });

      const opneid = data.data.openid || '';

      if (!opneid) {
        console.error('[WxCallback] 公众号登录失败: 未获取到 openid, 响应:', JSON.stringify(data));
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin?error=wx_openid_failed`
        );
      }

      const redirectUrl = new URL('/auth/signin', request.nextUrl.origin);
      redirectUrl.searchParams.set('id', opneid);
      redirectUrl.searchParams.set('type', 'wxlogin');

      console.log('[WxCallback] 公众号登录成功, openid:', opneid, ', 跳转:', redirectUrl.toString());

      return NextResponse.redirect(redirectUrl, { status: 302 });
    }
  } catch (error) {
    console.error('[WxCallback] 微信回调处理异常:', error instanceof Error ? error.message : error);
    console.error('[WxCallback] 异常堆栈:', error instanceof Error ? error.stack : '无');
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin?error=wx_callback_failed`
    );
  }
}

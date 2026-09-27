export const dynamic = 'force-dynamic';

import crypto from 'crypto';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/core/prisma';
import { getGeneratorName } from '@/lib/utils/name-generator';
import { grantInitialCredits } from '@/models/credit';

const MP_STATE_COOKIE = 'mvpfast.wx.mp_state';
const OPEN_STATE_COOKIE = 'mvpfast.wx.open_state';

type WechatTokenResponse = {
  access_token?: string;
  openid?: string;
  unionid?: string;
  errcode?: number;
};

type WechatUserInfo = {
  nickname?: string;
  headimgurl?: string;
  unionid?: string;
  errcode?: number;
};

function redirectSignIn(request: NextRequest, error: string) {
  const url = new URL('/auth/signin', request.nextUrl.origin);
  url.searchParams.set('error', error);
  const response = NextResponse.redirect(url);
  response.cookies.delete(MP_STATE_COOKIE);
  response.cookies.delete(OPEN_STATE_COOKIE);
  return response;
}

function hasValidState(request: NextRequest, state: string | null, cookieName: string, prefix: string) {
  const expected = request.cookies.get(cookieName)?.value || '';
  const received = state || '';
  const expectedBytes = Buffer.from(expected);
  const receivedBytes = Buffer.from(received);
  return received.startsWith(prefix) && expectedBytes.length > 0 &&
    expectedBytes.length === receivedBytes.length &&
    crypto.timingSafeEqual(expectedBytes, receivedBytes);
}

async function exchangeCode(code: string, appid: string, secret: string) {
  const url = new URL('https://api.weixin.qq.com/sns/oauth2/access_token');
  url.search = new URLSearchParams({ appid, secret, code, grant_type: 'authorization_code' }).toString();
  const response = await axios.get<WechatTokenResponse>(url.toString(), { timeout: 10000 });
  return response.data;
}

async function getWechatUserInfo(accessToken: string, openid: string) {
  const url = new URL('https://api.weixin.qq.com/sns/userinfo');
  url.search = new URLSearchParams({ access_token: accessToken, openid, lang: 'zh_CN' }).toString();
  const response = await axios.get<WechatUserInfo>(url.toString(), { timeout: 10000 });
  return response.data;
}

async function createLoginTicket(userId: string) {
  const ticket = crypto.randomBytes(32).toString('base64url');
  await prisma.verificationCode.create({
    data: {
      identifier: userId,
      code: ticket,
      expires_at: new Date(Date.now() + 2 * 60 * 1000),
    },
  });
  return ticket;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  if (!code) return redirectSignIn(request, 'wx_no_code');

  const isOpenPlatform = state?.startsWith('open_') || false;
  if (isOpenPlatform) {
    if (!hasValidState(request, state, OPEN_STATE_COOKIE, 'open_')) {
      return redirectSignIn(request, 'wx_invalid_state');
    }
  } else if (!hasValidState(request, state, MP_STATE_COOKIE, 'mp_')) {
    return redirectSignIn(request, 'wx_invalid_state');
  }

  const appid = isOpenPlatform ? process.env.WECHAT_OPEN_APPID : process.env.NEXT_PUBLIC_WECHAT_APPID;
  const secret = isOpenPlatform ? process.env.WECHAT_OPEN_APPSECRET : process.env.WECHAT_MP_APPSECRET;
  if (!appid || !secret) return redirectSignIn(request, 'wx_not_configured');

  try {
    const token = await exchangeCode(code, appid, secret);
    if (token.errcode || !token.openid || !token.access_token) {
      return redirectSignIn(request, 'wx_token_failed');
    }

    let info: WechatUserInfo = {};
    try {
      const response = await getWechatUserInfo(token.access_token, token.openid);
      if (!response.errcode) info = response;
    } catch {
      // 用户资料非登录所必需，OpenID 已由换码接口验证。
    }

    const unionid = token.unionid || info.unionid;
    let user = unionid
      ? await prisma.user.findFirst({ where: { wechatUnionId: unionid } })
      : null;
    if (!user) {
      user = await prisma.user.findFirst({ where: { wechatOpenId: token.openid } });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          wechatOpenId: token.openid,
          wechatUnionId: unionid || null,
          nickName: info.nickname || getGeneratorName(),
          avatar: info.headimgurl || null,
          email: null,
          phone: null,
        },
      });
      await grantInitialCredits(user.id);
    } else {
      const update: { wechatUnionId?: string; nickName?: string; avatar?: string } = {};
      if (unionid && !user.wechatUnionId) update.wechatUnionId = unionid;
      if (info.nickname && info.nickname !== user.nickName) update.nickName = info.nickname;
      if (info.headimgurl && info.headimgurl !== user.avatar) update.avatar = info.headimgurl;
      if (Object.keys(update).length) {
        user = await prisma.user.update({ where: { id: user.id }, data: update });
      }
    }

    const loginToken = await createLoginTicket(user.id);
    const url = new URL('/auth/signin', request.nextUrl.origin);
    url.searchParams.set('id', user.id);
    url.searchParams.set('type', 'wxlogin');
    url.searchParams.set('loginToken', loginToken);
    const response = NextResponse.redirect(url, { status: 302 });
    response.cookies.delete(MP_STATE_COOKIE);
    response.cookies.delete(OPEN_STATE_COOKIE);
    return response;
  } catch (error) {
    console.error('[WxCallback] 微信回调失败:', error instanceof Error ? error.message : error);
    return redirectSignIn(request, 'wx_callback_failed');
  }
}

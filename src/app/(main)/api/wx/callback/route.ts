export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { encode } from 'next-auth/jwt';
import prisma from '@/lib/core/prisma';
import { getGeneratorName } from '@/lib/utils/name-generator';
import { grantInitialCredits } from '@/models/credit';

// 根据环境决定 cookie 名称和 salt
// 生产环境 HTTPS 下 NextAuth 使用 __Secure- 前缀
const useSecureCookies = process.env.NODE_ENV === 'production';
const cookieName = useSecureCookies
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

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

// 从 state 参数中解析 redirect 路径
// state 格式: open_<random> 或 open_<random>_redirect_<encodedPath>
function parseRedirectFromState(state: string | null): string | null {
  if (!state) return null;
  const marker = '_redirect_';
  const idx = state.indexOf(marker);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(state.substring(idx + marker.length));
  } catch {
    return null;
  }
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

      // 3. 查找或创建用户
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
        isNewUser = true;
        console.log('[WxCallback] 创建新用户:', user.id);

        // 新用户注册，赠送初始积分
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

      // 4. 生成 JWT token（包含 role 字段）
      console.log('[WxCallback] 正在生成 JWT, cookie 名:', cookieName);
      const token = await encode({
        token: {
          sub: user.id,
          email: user.email,
          phone: user.phone,
          wechatOpenId: user.wechatOpenId,
          wechatUnionId: user.wechatUnionId,
          nickName: user.nickName,
          avatar: user.avatar,
          role: user.role,
        },
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET!,
        salt: cookieName,
      });

      // 5. 确定跳转地址
      const redirectPath = parseRedirectFromState(state);
      const redirectUrl = new URL(redirectPath || '/', request.nextUrl.origin);
      console.log('[WxCallback] 登录成功, 用户:', user.id, ', role:', user.role, ', isNew:', isNewUser, ', 跳转:', redirectUrl.pathname);

      // 6. 设置 cookie 并跳转
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set(cookieName, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
        maxAge: 2 * 60 * 60, // 2小时，与 auth.ts 中的 session.maxAge 保持一致
      });

      return response;
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

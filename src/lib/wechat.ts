// app/utils/wechat.ts
import { createHash } from 'crypto';

// 内存缓存对象
const tokenCache = {
  access_token: '',
  ticket: '',
  access_token_expires: 0,
  ticket_expires: 0,
};

// 生成签名
export function generateSignature(params: {
  noncestr: string;
  timestamp: number;
  url: string;
  jsapi_ticket: string;
}) {
  // 1. 对所有待签名参数按照字段名的ASCII码从小到大排序
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  // 2. 使用 SHA1 进行签名
  const signature = createHash('sha1').update(sortedParams).digest('hex');

  return signature;
}

// 获取微信 access_token
async function getAccessToken() {
  try {
    const now = Date.now();

    // 检查缓存是否有效
    if (
      tokenCache.access_token &&
      now < tokenCache.access_token_expires - 60000 // 提前1分钟过期
    ) {
      return tokenCache.access_token;
    }

    // 从微信服务器获取新的 access_token
    const response = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${process.env.NEXT_PUBLIC_WECHAT_APPID}&secret=${process.env.WX_APP_SECRET}`
    );

    const data = await response.json();

    if (data.errcode) {
      throw new Error(`获取 access_token 失败: ${data.errmsg}`);
    }

    // 更新缓存
    tokenCache.access_token = data.access_token;
    tokenCache.access_token_expires = now + data.expires_in * 1000;

    return data.access_token;
  } catch (error) {
    console.error('获取 access_token 失败:', error);
    throw error;
  }
}

// 获取 jsapi_ticket
export async function getJsApiTicket() {
  try {
    const now = Date.now();

    // 检查缓存是否有效
    if (
      tokenCache.ticket &&
      now < tokenCache.ticket_expires - 60000 // 提前1分钟过期
    ) {
      return tokenCache.ticket;
    }

    // 如果缓存无效，获取新的 ticket
    const accessToken = await getAccessToken();
    const response = await fetch(
      `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`
    );

    const data = await response.json();

    if (data.errcode !== 0) {
      throw new Error(`获取 jsapi_ticket 失败: ${data.errmsg}`);
    }

    // 更新缓存
    tokenCache.ticket = data.ticket;
    tokenCache.ticket_expires = now + data.expires_in * 1000;

    return data.ticket;
  } catch (error) {
    console.error('获取 jsapi_ticket 失败:', error);
    throw error;
  }
}

// 添加重试机制的包装函数
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// 清除缓存的方法（在遇到 token 相关错误时可以调用）
export function clearTokenCache() {
  tokenCache.access_token = '';
  tokenCache.ticket = '';
  tokenCache.access_token_expires = 0;
  tokenCache.ticket_expires = 0;
}

// 用于调试的方法
export function getTokenStatus() {
  if (process.env.NODE_ENV === 'development') {
    return {
      hasAccessToken: !!tokenCache.access_token,
      accessTokenExpires: new Date(tokenCache.access_token_expires),
      hasTicket: !!tokenCache.ticket,
      ticketExpires: new Date(tokenCache.ticket_expires),
    };
  }
  return null;
}

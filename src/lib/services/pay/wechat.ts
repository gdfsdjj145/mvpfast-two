/**
 * 微信支付服务
 *
 * @module @/lib/services/pay/wechat
 */

import crypto from 'crypto';
import axios from 'axios';
import { getWechatPayVerificationKey } from './notification';

const WECHAT_PAY_URL =
  'https://api.mch.weixin.qq.com/v3/pay/transactions/native';
const JSAPI_PAY_URL = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';

const NATIVE_PAY_PATHNAME = '/v3/pay/transactions/native';
const JSAPI_PAY_PATHNAME = '/v3/pay/transactions/jsapi';

function getNotifyUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) throw new Error('NEXT_PUBLIC_SITE_URL environment variable is not set');
  const apiV3Key = process.env.WECHAT_API_V3_KEY;
  const verificationKey = process.env.WECHAT_PAY_VERIFY_KEY;
  const verificationSerial = process.env.WECHAT_PAY_VERIFY_SERIAL;
  if (!apiV3Key || !verificationKey || !verificationSerial) {
    throw new Error('微信支付通知验签尚未配置');
  }
  if (Buffer.byteLength(apiV3Key, 'utf8') !== 32) {
    throw new Error('微信支付通知验签配置无效');
  }
  getWechatPayVerificationKey(verificationKey, verificationSerial, process.env.WECHAT_SERIAL_NO);
  const url = new URL('/api/wechat-pay-callback', siteUrl);
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('微信支付通知地址必须使用 HTTPS');
  }
  return url.toString();
}

interface OrderInfo {
  description: string;
  outTradeNo: string;
  amount: number;
}

export function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

export function generateTimestamp() {
  return Math.floor(Date.now() / 1000).toString();
}

function generateSignature(
  method: string,
  url: string,
  timestamp: string,
  nonce: string,
  body: string
) {
  const message = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;

  const privateKey = process.env.WECHAT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('WECHAT_PRIVATE_KEY environment variable is not set');
  }

  const signature = crypto
    .createSign('RSA-SHA256')
    .update(message)
    .sign(privateKey, 'base64');
  return signature;
}

export function generateJsapiSignature(prepayId: string, timestamp: string, nonce: string) {
  const privateKey = process.env.WECHAT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('WECHAT_PRIVATE_KEY environment variable is not set');
  }
  const message = `${process.env.NEXT_PUBLIC_WECHAT_APPID}\n${timestamp}\n${nonce}\n${prepayId}\n`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(message)
    .sign(privateKey, 'base64');
  return signature;
}

export async function createNativeOrder(orderInfo: OrderInfo) {
  const method = 'POST';
  const timestamp = generateTimestamp();
  const nonce = generateNonce();

  const body = JSON.stringify({
    appid: process.env.NEXT_PUBLIC_WECHAT_APPID,
    mchid: process.env.WECHAT_MCHID,
    description: orderInfo.description,
    out_trade_no: orderInfo.outTradeNo,
    notify_url: getNotifyUrl(),
    amount: {
      total: orderInfo.amount,
      currency: 'CNY',
    },
  });

  const signature = generateSignature(
    method,
    NATIVE_PAY_PATHNAME,
    timestamp,
    nonce,
    body
  );

  const authorizationString = `WECHATPAY2-SHA256-RSA2048 mchid="${process.env.WECHAT_MCHID}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${process.env.WECHAT_SERIAL_NO}"`;

  try {
    const response = await axios.post(WECHAT_PAY_URL, body, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authorizationString,
      },
    });

    return response.data;
  } catch (error) {
    console.error('创建微信支付订单失败:', error);
    throw error;
  }
}

export async function createJsapiOrder(orderInfo: OrderInfo, userId: string) {
  const method = 'POST';
  const timestamp = generateTimestamp();
  const nonce = generateNonce();

  const body = JSON.stringify({
    appid: process.env.NEXT_PUBLIC_WECHAT_APPID,
    mchid: process.env.WECHAT_MCHID,
    description: orderInfo.description,
    out_trade_no: orderInfo.outTradeNo,
    notify_url: getNotifyUrl(),
    amount: {
      total: orderInfo.amount,
      currency: 'CNY',
    },
    payer: {
      openid: userId,
    },
  });

  const signature = generateSignature(
    method,
    JSAPI_PAY_PATHNAME,
    timestamp,
    nonce,
    body
  );

  const authorizationString = `WECHATPAY2-SHA256-RSA2048 mchid="${process.env.WECHAT_MCHID}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${process.env.WECHAT_SERIAL_NO}"`;

  try {
    const response = await axios.post(JSAPI_PAY_URL, body, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authorizationString,
      },
    });

    return response.data;
  } catch (error) {
    console.error('创建微信小程序支付订单失败:', error);
    throw error;
  }
}

export async function queryOrder(outTradeNo: string) {
  const url = new URL(
    `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${outTradeNo}`
  );
  url.searchParams.append('mchid', process.env.WECHAT_MCHID as string);

  const method = 'GET';
  const timestamp = generateTimestamp();
  const nonce = generateNonce();

  const signature = generateSignature(
    method,
    url.pathname + url.search,
    timestamp,
    nonce,
    ''
  );

  const authorizationString = `WECHATPAY2-SHA256-RSA2048 mchid="${process.env.WECHAT_MCHID}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${process.env.WECHAT_SERIAL_NO}"`;

  try {
    const response = await axios.get(url.toString(), {
      headers: {
        Accept: 'application/json',
        Authorization: authorizationString,
      },
    });

    return response.data;
  } catch (error) {
    console.error('查询微信支付订单失败:', error);
    throw error;
  }
}

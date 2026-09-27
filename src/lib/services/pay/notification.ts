import crypto from 'crypto';

export type WechatPayNotification = {
  event_type: string;
  resource?: {
    algorithm: string;
    ciphertext: string;
    associated_data?: string;
    nonce: string;
  };
};

export type WechatPayTransaction = {
  appid: string;
  mchid: string;
  out_trade_no: string;
  transaction_id: string;
  trade_state: string;
  amount: { total: number; currency: string };
};

export function getWechatPayVerificationKey(
  pem: string,
  expectedSerial: string,
  merchantSerial?: string,
) {
  const normalized = pem.replace(/\\n/g, '\n').trim();
  if (!expectedSerial) throw new Error('微信支付验签序列号缺失');

  if (normalized.includes('-----BEGIN CERTIFICATE-----')) {
    const certificate = new crypto.X509Certificate(normalized);
    const serial = certificate.serialNumber.replace(/^0+/, '').toUpperCase();
    if (serial !== expectedSerial.replace(/^0+/, '').toUpperCase() ||
        (merchantSerial && serial === merchantSerial.replace(/^0+/, '').toUpperCase())) {
      throw new Error('微信支付平台证书序列号不匹配，或误用了商户 API 证书');
    }
    return certificate.publicKey;
  }

  if (normalized.includes('-----BEGIN PUBLIC KEY-----') &&
      expectedSerial.startsWith('PUB_KEY_ID_')) {
    return crypto.createPublicKey(normalized);
  }
  throw new Error('微信支付验签材料必须是公钥或平台证书 PEM');
}

export function verifyWechatPayNotification(
  headers: Headers,
  rawBody: string,
  key: string,
  expectedSerial: string,
  now = Date.now(),
  merchantSerial?: string,
) {
  const timestamp = headers.get('wechatpay-timestamp');
  const nonce = headers.get('wechatpay-nonce');
  const signature = headers.get('wechatpay-signature');
  const serial = headers.get('wechatpay-serial');
  const seconds = Number(timestamp);
  if (!timestamp || !nonce || !signature || !serial || serial !== expectedSerial ||
      !Number.isFinite(seconds) || Math.abs(now / 1000 - seconds) > 300) {
    return false;
  }

  const message = `${timestamp}\n${nonce}\n${rawBody}\n`;
  try {
    const publicKey = getWechatPayVerificationKey(key, expectedSerial, merchantSerial);
    return crypto.verify(
      'RSA-SHA256',
      Buffer.from(message),
      publicKey,
      Buffer.from(signature, 'base64'),
    );
  } catch {
    return false;
  }
}

export function decryptWechatPayNotification(
  resource: NonNullable<WechatPayNotification['resource']>,
  apiV3Key: string,
): WechatPayTransaction {
  if (resource.algorithm !== 'AEAD_AES_256_GCM') {
    throw new Error('不支持的微信支付通知加密算法');
  }
  const key = Buffer.from(apiV3Key, 'utf8');
  const encrypted = Buffer.from(resource.ciphertext, 'base64');
  if (key.length !== 32 || encrypted.length <= 16) {
    throw new Error('微信支付通知密钥或密文无效');
  }

  const body = encrypted.subarray(0, -16);
  const tag = encrypted.subarray(-16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(resource.nonce, 'utf8'));
  decipher.setAAD(Buffer.from(resource.associated_data || '', 'utf8'));
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
  return JSON.parse(plaintext) as WechatPayTransaction;
}

import crypto from 'crypto';
import tls from 'tls';
import { describe, expect, it } from 'vitest';
import {
  decryptWechatPayNotification,
  getWechatPayVerificationKey,
  verifyWechatPayNotification,
  type WechatPayNotification,
} from '@/lib/services/pay/notification';

describe('微信支付通知', () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const platformKey = publicKey.export({ type: 'spki', format: 'pem' }).toString();

  it('验签并解密可信的支付成功通知', () => {
    const apiV3Key = '0123456789abcdef0123456789abcdef';
    const nonce = '123456789012';
    const associatedData = 'transaction';
    const transaction = {
      appid: 'wx-test',
      mchid: 'merchant-test',
      out_trade_no: 'ORDER_123',
      transaction_id: 'WX_123',
      trade_state: 'SUCCESS',
      amount: { total: 100, currency: 'CNY' },
    };
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(apiV3Key), Buffer.from(nonce));
    cipher.setAAD(Buffer.from(associatedData));
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(transaction)), cipher.final(), cipher.getAuthTag(),
    ]).toString('base64');
    const notification: WechatPayNotification = {
      event_type: 'TRANSACTION.SUCCESS',
      resource: { algorithm: 'AEAD_AES_256_GCM', ciphertext, associated_data: associatedData, nonce },
    };
    const rawBody = JSON.stringify(notification);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const requestNonce = 'notification-nonce';
    const signature = crypto.sign(
      'RSA-SHA256',
      Buffer.from(`${timestamp}\n${requestNonce}\n${rawBody}\n`),
      privateKey,
    ).toString('base64');
    const headers = new Headers({
      'wechatpay-timestamp': timestamp,
      'wechatpay-nonce': requestNonce,
      'wechatpay-signature': signature,
      'wechatpay-serial': 'PUB_KEY_ID_TEST',
    });

    expect(verifyWechatPayNotification(headers, rawBody, platformKey, 'PUB_KEY_ID_TEST')).toBe(true);
    expect(decryptWechatPayNotification(notification.resource!, apiV3Key)).toEqual(transaction);
    expect(verifyWechatPayNotification(headers, rawBody + ' ', platformKey, 'PUB_KEY_ID_TEST')).toBe(false);
    expect(verifyWechatPayNotification(headers, rawBody, platformKey, 'PUB_KEY_ID_OTHER')).toBe(false);
    expect(verifyWechatPayNotification(headers, rawBody, platformKey, 'PUB_KEY_ID_TEST', Date.now() + 600000)).toBe(false);
    expect(() => decryptWechatPayNotification({ ...notification.resource!, ciphertext: 'bad' }, apiV3Key)).toThrow();
  });

  it('接受匹配序列号的平台证书，拒绝商户 API 证书', () => {
    const certificate = tls.rootCertificates[0];
    const serial = new crypto.X509Certificate(certificate).serialNumber;
    expect(getWechatPayVerificationKey(certificate, serial)).toBeInstanceOf(crypto.KeyObject);
    expect(() => getWechatPayVerificationKey(certificate, serial, serial)).toThrow();
  });
});

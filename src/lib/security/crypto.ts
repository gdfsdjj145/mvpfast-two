/**
 * 加密工具库
 *
 * 提供数据加密、解密、哈希等安全功能
 *
 * @module @/lib/security/crypto
 */

import crypto from 'crypto';

// ============================================
// 配置
// ============================================

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

/**
 * 获取加密密钥
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('未配置加密密钥 (ENCRYPTION_SECRET 或 NEXTAUTH_SECRET)');
  }

  return crypto.createHash('sha256').update(secret).digest();
}

// ============================================
// AES-256-GCM 加密/解密
// ============================================

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted,
  ].join(':');
}

export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();

  const [ivBase64, authTagBase64, encrypted] = ciphertext.split(':');

  if (!ivBase64 || !authTagBase64 || !encrypted) {
    throw new Error('无效的加密数据格式');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function safeEncrypt(plaintext: string): string | null {
  try {
    return encrypt(plaintext);
  } catch {
    return null;
  }
}

export function safeDecrypt(ciphertext: string): string | null {
  try {
    return decrypt(ciphertext);
  } catch {
    return null;
  }
}

// ============================================
// 密码哈希
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH);

    crypto.pbkdf2(
      password,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha512',
      (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(`${salt.toString('hex')}:${derivedKey.toString('hex')}`);
      }
    );
  });
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [saltHex, hashHex] = storedHash.split(':');

    if (!saltHex || !hashHex) {
      resolve(false);
      return;
    }

    const salt = Buffer.from(saltHex, 'hex');
    const expectedHash = Buffer.from(hashHex, 'hex');

    crypto.pbkdf2(
      password,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha512',
      (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(crypto.timingSafeEqual(derivedKey, expectedHash));
      }
    );
  });
}

// ============================================
// 哈希函数
// ============================================

export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function sha512(data: string): string {
  return crypto.createHash('sha512').update(data).digest('hex');
}

export function md5(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

export function hmacSha256(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export function hmacSha512(data: string, secret: string): string {
  return crypto.createHmac('sha512', secret).update(data).digest('hex');
}

// ============================================
// 随机数生成
// ============================================

export function randomBytes(length: number): Buffer {
  return crypto.randomBytes(length);
}

export function randomHex(length: number = 32): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

export function randomBase64(length: number = 32): string {
  return crypto.randomBytes(Math.ceil((length * 3) / 4)).toString('base64').slice(0, length);
}

export function randomUrlSafe(length: number = 32): string {
  return crypto
    .randomBytes(Math.ceil((length * 3) / 4))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, length);
}

export function randomDigits(length: number = 6): string {
  let result = '';
  const bytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += (bytes[i] % 10).toString();
  }

  return result;
}

export function uuid(): string {
  return crypto.randomUUID();
}

// ============================================
// Token 生成
// ============================================

export function generateApiToken(): string {
  const timestamp = Date.now().toString(36);
  const random = randomUrlSafe(32);
  return `${timestamp}_${random}`;
}

export function generateRefreshToken(): string {
  return randomUrlSafe(64);
}

export function generateInviteCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  const bytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return result;
}

// ============================================
// 数据脱敏
// ============================================

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;

  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2
    ? local[0] + '***' + local.slice(-1)
    : local[0] + '***';

  return `${maskedLocal}@${domain}`;
}

export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.slice(0, 4) + '***********' + idCard.slice(-4);
}

export function maskBankCard(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 8) return cardNumber;

  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.slice(0, 4) + ' **** **** ' + cleaned.slice(-4);
}

export function maskName(name: string): string {
  if (!name || name.length < 2) return name;

  if (name.length === 2) {
    return name[0] + '*';
  }

  return name[0] + '*'.repeat(name.length - 2) + name.slice(-1);
}

export default {
  encrypt,
  decrypt,
  safeEncrypt,
  safeDecrypt,
  hashPassword,
  verifyPassword,
  sha256,
  sha512,
  md5,
  hmacSha256,
  hmacSha512,
  randomBytes,
  randomHex,
  randomBase64,
  randomUrlSafe,
  randomDigits,
  uuid,
  generateApiToken,
  generateRefreshToken,
  generateInviteCode,
  maskPhone,
  maskEmail,
  maskIdCard,
  maskBankCard,
  maskName,
};

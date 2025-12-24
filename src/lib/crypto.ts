/**
 * 加密工具库
 *
 * 提供数据加密、解密、哈希等安全功能
 *
 * @example
 * ```ts
 * import { encrypt, decrypt, hashPassword, verifyPassword } from '@/lib/crypto';
 *
 * // 加密敏感数据
 * const encrypted = encrypt('sensitive data');
 * const decrypted = decrypt(encrypted);
 *
 * // 密码哈希
 * const hash = await hashPassword('user-password');
 * const isValid = await verifyPassword('user-password', hash);
 * ```
 */

import crypto from 'crypto';

// ============================================
// 配置
// ============================================

/**
 * 加密算法
 */
const ALGORITHM = 'aes-256-gcm';

/**
 * 密钥长度 (字节)
 */
const KEY_LENGTH = 32;

/**
 * IV 长度 (字节)
 */
const IV_LENGTH = 16;

/**
 * Auth Tag 长度 (字节)
 */
const AUTH_TAG_LENGTH = 16;

/**
 * Salt 长度 (字节)
 */
const SALT_LENGTH = 32;

/**
 * PBKDF2 迭代次数
 */
const PBKDF2_ITERATIONS = 100000;

/**
 * 获取加密密钥
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('未配置加密密钥 (ENCRYPTION_SECRET 或 NEXTAUTH_SECRET)');
  }

  // 使用 SHA-256 确保密钥长度正确
  return crypto.createHash('sha256').update(secret).digest();
}

// ============================================
// AES-256-GCM 加密/解密
// ============================================

/**
 * 加密数据
 *
 * 使用 AES-256-GCM 算法加密数据
 *
 * @example
 * ```ts
 * const encrypted = encrypt('sensitive data');
 * // 返回格式: iv:authTag:encryptedData (Base64)
 * ```
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // 组合: iv:authTag:encrypted
  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted,
  ].join(':');
}

/**
 * 解密数据
 *
 * @example
 * ```ts
 * const decrypted = decrypt(encryptedString);
 * ```
 */
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

/**
 * 安全地加密数据 (捕获异常)
 */
export function safeEncrypt(plaintext: string): string | null {
  try {
    return encrypt(plaintext);
  } catch {
    return null;
  }
}

/**
 * 安全地解密数据 (捕获异常)
 */
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

/**
 * 哈希密码
 *
 * 使用 PBKDF2 算法哈希密码
 *
 * @example
 * ```ts
 * const hash = await hashPassword('user-password');
 * // 返回格式: salt:hash (Hex)
 * ```
 */
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

/**
 * 验证密码
 *
 * @example
 * ```ts
 * const isValid = await verifyPassword('user-password', storedHash);
 * ```
 */
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

        // 使用时间安全的比较
        resolve(crypto.timingSafeEqual(derivedKey, expectedHash));
      }
    );
  });
}

// ============================================
// 哈希函数
// ============================================

/**
 * SHA-256 哈希
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * SHA-512 哈希
 */
export function sha512(data: string): string {
  return crypto.createHash('sha512').update(data).digest('hex');
}

/**
 * MD5 哈希 (不安全，仅用于校验和)
 */
export function md5(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * HMAC-SHA256 签名
 *
 * @example
 * ```ts
 * const signature = hmacSha256('data', 'secret-key');
 * ```
 */
export function hmacSha256(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * HMAC-SHA512 签名
 */
export function hmacSha512(data: string, secret: string): string {
  return crypto.createHmac('sha512', secret).update(data).digest('hex');
}

// ============================================
// 随机数生成
// ============================================

/**
 * 生成安全的随机字节
 */
export function randomBytes(length: number): Buffer {
  return crypto.randomBytes(length);
}

/**
 * 生成安全的随机十六进制字符串
 */
export function randomHex(length: number = 32): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * 生成安全的随机 Base64 字符串
 */
export function randomBase64(length: number = 32): string {
  return crypto.randomBytes(Math.ceil((length * 3) / 4)).toString('base64').slice(0, length);
}

/**
 * 生成 URL 安全的随机字符串
 */
export function randomUrlSafe(length: number = 32): string {
  return crypto
    .randomBytes(Math.ceil((length * 3) / 4))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, length);
}

/**
 * 生成随机数字字符串 (用于验证码)
 */
export function randomDigits(length: number = 6): string {
  let result = '';
  const bytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += (bytes[i] % 10).toString();
  }

  return result;
}

/**
 * 生成 UUID v4
 */
export function uuid(): string {
  return crypto.randomUUID();
}

// ============================================
// Token 生成
// ============================================

/**
 * 生成 API Token
 */
export function generateApiToken(): string {
  const timestamp = Date.now().toString(36);
  const random = randomUrlSafe(32);
  return `${timestamp}_${random}`;
}

/**
 * 生成刷新令牌
 */
export function generateRefreshToken(): string {
  return randomUrlSafe(64);
}

/**
 * 生成邀请码
 */
export function generateInviteCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易混淆的字符
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

/**
 * 脱敏手机号
 *
 * @example
 * ```ts
 * maskPhone('13812345678'); // '138****5678'
 * ```
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

/**
 * 脱敏邮箱
 *
 * @example
 * ```ts
 * maskEmail('user@example.com'); // 'u***@example.com'
 * ```
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;

  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2
    ? local[0] + '***' + local.slice(-1)
    : local[0] + '***';

  return `${maskedLocal}@${domain}`;
}

/**
 * 脱敏身份证号
 *
 * @example
 * ```ts
 * maskIdCard('110101199001011234'); // '1101***********1234'
 * ```
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.slice(0, 4) + '***********' + idCard.slice(-4);
}

/**
 * 脱敏银行卡号
 *
 * @example
 * ```ts
 * maskBankCard('6222021234567890123'); // '6222 **** **** 0123'
 * ```
 */
export function maskBankCard(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 8) return cardNumber;

  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.slice(0, 4) + ' **** **** ' + cleaned.slice(-4);
}

/**
 * 脱敏姓名
 *
 * @example
 * ```ts
 * maskName('张三'); // '张*'
 * maskName('张三丰'); // '张*丰'
 * ```
 */
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

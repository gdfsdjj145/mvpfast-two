/**
 * 安全模块
 *
 * @module @/lib/security
 */

// 加密工具
export {
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
} from './crypto';

// 安全工具
export {
  getContentSecurityPolicy,
  getSecurityHeaders,
  securityHeadersForNextConfig,
  getCorsHeaders,
  withCors,
  generateCsrfToken,
  validateCsrfToken,
  withCsrfProtection,
  escapeHtml,
  sanitizeInput,
  sanitizeObject,
  sanitizeMongoQuery,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  checkPasswordStrength,
  generateSecurePassword,
  defaultCorsOptions,
  type SecurityHeaders,
  type CorsOptions,
  type PasswordStrength,
} from './sanitize';

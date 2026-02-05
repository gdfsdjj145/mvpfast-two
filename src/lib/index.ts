/**
 * Lib 模块统一导出
 *
 * 使用方式：
 * import { cn, formatDate, AppError, logger } from '@/lib';
 *
 * 或使用分模块导入（推荐）：
 * import { cn } from '@/lib/utils';
 * import { AppError } from '@/lib/core';
 * import { requireAdmin } from '@/lib/auth';
 *
 * 新的模块化结构:
 * - @/lib/core     - 核心功能 (errors, logger, prisma)
 * - @/lib/api      - API 工具 (handler, logger, rate-limit, security)
 * - @/lib/auth     - 认证授权 (rbac, utils)
 * - @/lib/config   - 配置管理 (env, service)
 * - @/lib/security - 安全工具 (crypto, sanitize)
 * - @/lib/services - 外部服务 (email, sms, storage, pay)
 * - @/lib/utils    - 通用工具 (common, name-generator)
 * - @/lib/init     - 初始化服务 (service)
 */

// ============ 核心模块 ============
export {
  ErrorCode,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  DatabaseError,
  PaymentError,
  isAppError,
  toAppError,
} from './core/errors';

export {
  logger,
  createChildLogger,
  createModuleLogger,
  apiLogger,
  dbLogger,
  authLogger,
  paymentLogger,
  logApiRequest,
  logApiResponse,
  logApiError,
  logDbOperation,
  logPerformance,
  createTimer,
  logSecurityEvent,
  logBusinessEvent,
} from './core/logger';

export { default as prisma } from './core/prisma';

// ============ API 工具 ============
export {
  withErrorHandler,
  successResponse,
  errorResponse,
  validateRequestBody,
  getPaginationParams,
  getQueryParam,
  type ApiResponse,
} from './api/handler';

export {
  withRequestLogging,
  withAdvancedRequestLogging,
  withConsoleLogging,
  generateRequestId,
  extractClientInfo,
} from './api/logger';

export {
  rateLimit,
  withRateLimit,
  withMultiRateLimit,
  apiLimiter,
  authLimiter,
  codeLimiter,
  strictLimiter,
  getClientIdentifier,
} from './api/rate-limit';

export {
  withSecurity,
  withSecureApi,
  withAuthSecurity,
  withSensitiveSecurity,
  withPublicSecurity,
  safeParseBody,
  createSecureErrorResponse,
} from './api/security';

// ============ 认证授权 ============
export {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROUTE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  getAllPermissions,
  type Permission,
  type Role,
} from './auth/rbac';

export {
  getSessionRole,
  requireAdmin,
  isAdmin,
  requirePermission,
  getClientInfo,
  type AdminUser,
} from './auth/utils';

// ============ 配置管理 ============
export {
  serverEnv,
  clientEnv,
  isDevelopment,
  isProduction,
  isTest,
  isWechatPayConfigured,
  isYungouPayConfigured,
  isSmsConfigured,
  isR2Configured,
  isEmailConfigured,
  getRequiredEnv,
  getOptionalEnv,
} from './config/env';

export {
  clearConfigCache,
  getAllConfigs,
  getConfig,
  getConfigObject,
} from './config/service';

// ============ 安全工具 ============
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
} from './security/crypto';

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
} from './security/sanitize';

// ============ 外部服务 ============
export { default as sendEmail, type MailInfo } from './services/email';
export { default as sendPhone } from './services/sms';

export {
  validateFile,
  generateKey,
  uploadToR2,
  deleteFromR2,
  getKeyFromUrl,
} from './services/storage';

export {
  generateNonce,
  generateTimestamp,
  generateJsapiSignature,
  createNativeOrder,
  createJsapiOrder,
  queryOrder,
  paySign,
} from './services/pay';

// ============ 通用工具 ============
export {
  cn,
  renderText,
  isWeixinBrowser,
  formatDate,
  formatDateTime,
  formatDateTimeShort,
} from './utils/common';

export {
  getGeneratorName,
  generateNickname,
} from './utils/name-generator';

// ============ 初始化服务 ============
export {
  isSystemInitialized,
  executeInit,
  type InitParams,
  type InitResult,
} from './init/service';

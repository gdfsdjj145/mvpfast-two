/**
 * API 模块
 *
 * 包含 API 中间件、错误处理、日志、限流、安全等功能
 *
 * @module @/lib/api
 */

// 错误处理和响应
export {
  withErrorHandler,
  successResponse,
  errorResponse,
  validateRequestBody,
  getPaginationParams,
  getQueryParam,
  type ApiResponse,
} from './handler';

// 请求日志
export {
  withRequestLogging,
  withAdvancedRequestLogging,
  withConsoleLogging,
  generateRequestId,
  extractClientInfo,
  type RequestLoggingOptions,
} from './logger';

// 限流
export {
  rateLimit,
  withRateLimit,
  withMultiRateLimit,
  apiLimiter,
  authLimiter,
  codeLimiter,
  strictLimiter,
  getClientIdentifier,
  type RateLimitConfig,
  type RateLimitResult,
  type RateLimiter,
  type RateLimitMiddlewareConfig,
} from './rate-limit';

// 安全中间件
export {
  withSecurity,
  withSecureApi,
  withAuthSecurity,
  withSensitiveSecurity,
  withPublicSecurity,
  safeParseBody,
  createSecureErrorResponse,
  type SecurityMiddlewareConfig,
} from './security';

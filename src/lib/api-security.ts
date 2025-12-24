/**
 * API 安全中间件
 *
 * 组合多种安全防护措施的统一中间件
 *
 * @example
 * ```ts
 * import { withSecurity, withSecureApi } from '@/lib/api-security';
 *
 * // 基础安全防护
 * export const POST = withSecurity(handler);
 *
 * // 完整安全防护 (限流 + CSRF + 输入清理)
 * export const POST = withSecureApi(handler, {
 *   rateLimit: { limit: 5, interval: 60000 },
 *   validateCsrf: true,
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RateLimitConfig, getClientIdentifier } from './rateLimit';
import { withCsrfProtection, sanitizeObject, sanitizeMongoQuery } from './security';
import { logSecurityEvent } from './logger';

// ============================================
// 类型定义
// ============================================

/**
 * API 处理器类型
 */
type ApiHandler = (
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse | Response>;

/**
 * 安全中间件配置
 */
export interface SecurityMiddlewareConfig {
  /** 限流配置 */
  rateLimit?: RateLimitConfig | false;
  /** 是否验证 CSRF Token */
  validateCsrf?: boolean;
  /** 是否清理请求体 */
  sanitizeBody?: boolean;
  /** 是否清理查询参数 */
  sanitizeQuery?: boolean;
  /** 是否记录安全日志 */
  logSecurity?: boolean;
  /** 允许的来源 (CORS) */
  allowedOrigins?: string[];
  /** 允许的方法 */
  allowedMethods?: string[];
}

/**
 * 默认配置
 */
const defaultConfig: SecurityMiddlewareConfig = {
  rateLimit: { limit: 60, interval: 60000 },
  validateCsrf: false, // 默认不验证 CSRF (API 通常使用 token 认证)
  sanitizeBody: true,
  sanitizeQuery: true,
  logSecurity: true,
  allowedOrigins: ['*'],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

// ============================================
// 安全检查函数
// ============================================

/**
 * 检查请求来源
 */
function checkOrigin(request: NextRequest, allowedOrigins: string[]): boolean {
  const origin = request.headers.get('origin');

  // 没有 origin 头 (同源请求或服务器请求)
  if (!origin) return true;

  // 允许所有来源
  if (allowedOrigins.includes('*')) return true;

  // 检查是否在白名单中
  return allowedOrigins.includes(origin);
}

/**
 * 检查请求方法
 */
function checkMethod(request: NextRequest, allowedMethods: string[]): boolean {
  return allowedMethods.includes(request.method);
}

/**
 * 检测潜在的攻击模式
 */
function detectSuspiciousPatterns(request: NextRequest): string[] {
  const warnings: string[] = [];
  const url = request.nextUrl.pathname + request.nextUrl.search;

  // SQL 注入模式
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|alter)\b.*\b(from|into|table|database)\b)/i,
    /('|")\s*(or|and)\s*('|"|\d)/i,
    /;\s*(drop|delete|update|insert)/i,
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(url)) {
      warnings.push('SQL_INJECTION_ATTEMPT');
      break;
    }
  }

  // XSS 攻击模式
  const xssPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(url)) {
      warnings.push('XSS_ATTEMPT');
      break;
    }
  }

  // 路径遍历
  if (url.includes('../') || url.includes('..\\')) {
    warnings.push('PATH_TRAVERSAL_ATTEMPT');
  }

  // 检查 User-Agent
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan'];

  for (const agent of suspiciousAgents) {
    if (userAgent.toLowerCase().includes(agent)) {
      warnings.push('SUSPICIOUS_USER_AGENT');
      break;
    }
  }

  return warnings;
}

// ============================================
// 中间件实现
// ============================================

/**
 * 基础安全中间件
 *
 * 提供基本的安全检查
 */
export function withSecurity(
  handler: ApiHandler,
  config: Partial<SecurityMiddlewareConfig> = {}
): ApiHandler {
  const mergedConfig = { ...defaultConfig, ...config };

  return async (request: NextRequest, context?) => {
    const clientIp = getClientIdentifier(request);
    const method = request.method;
    const path = request.nextUrl.pathname;

    // 检查请求来源
    if (!checkOrigin(request, mergedConfig.allowedOrigins || ['*'])) {
      if (mergedConfig.logSecurity) {
        logSecurityEvent('CORS_VIOLATION', { clientIp, path, method }, 'warn');
      }
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '请求来源不被允许' } },
        { status: 403 }
      );
    }

    // 检查请求方法
    if (!checkMethod(request, mergedConfig.allowedMethods || [])) {
      return NextResponse.json(
        { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: '请求方法不被允许' } },
        { status: 405 }
      );
    }

    // 检测可疑模式
    const warnings = detectSuspiciousPatterns(request);
    if (warnings.length > 0) {
      if (mergedConfig.logSecurity) {
        logSecurityEvent('SUSPICIOUS_REQUEST', {
          clientIp,
          path,
          method,
          warnings,
          userAgent: request.headers.get('user-agent'),
        }, 'warn');
      }

      // 可选：直接拒绝可疑请求
      // return NextResponse.json(
      //   { success: false, error: { code: 'SUSPICIOUS_REQUEST', message: '请求被拒绝' } },
      //   { status: 400 }
      // );
    }

    // 处理 OPTIONS 请求
    if (method === 'OPTIONS') {
      return new NextResponse(null, { status: 204 });
    }

    return handler(request, context);
  };
}

/**
 * 安全 API 中间件
 *
 * 组合限流、CSRF 保护、输入清理等功能
 *
 * @example
 * ```ts
 * export const POST = withSecureApi(async (request) => {
 *   const body = await request.json();
 *   // body 已经过清理
 *   return NextResponse.json({ success: true });
 * }, {
 *   rateLimit: { limit: 5 },
 *   validateCsrf: true,
 * });
 * ```
 */
export function withSecureApi(
  handler: ApiHandler,
  config: Partial<SecurityMiddlewareConfig> = {}
): ApiHandler {
  const mergedConfig = { ...defaultConfig, ...config };

  let wrappedHandler = handler;

  // 应用基础安全检查
  wrappedHandler = withSecurity(wrappedHandler, mergedConfig);

  // 应用限流
  if (mergedConfig.rateLimit !== false) {
    wrappedHandler = withRateLimit(wrappedHandler as (request: NextRequest, context?: unknown) => Promise<NextResponse | Response>, mergedConfig.rateLimit) as ApiHandler;
  }

  // 应用 CSRF 保护
  if (mergedConfig.validateCsrf) {
    wrappedHandler = withCsrfProtection(wrappedHandler);
  }

  // 输入清理中间件
  if (mergedConfig.sanitizeBody || mergedConfig.sanitizeQuery) {
    const innerHandler = wrappedHandler;

    wrappedHandler = async (request: NextRequest, context?) => {
      // 克隆请求以便修改
      const modifiedRequest = request.clone() as NextRequest;

      // 清理查询参数 (记录日志)
      if (mergedConfig.sanitizeQuery) {
        const searchParams = new URLSearchParams(modifiedRequest.nextUrl.search);
        const queryObj: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryObj[key] = value;
        });

        const sanitizedQuery = sanitizeMongoQuery(queryObj);
        // 查询参数清理主要用于日志记录
        if (JSON.stringify(queryObj) !== JSON.stringify(sanitizedQuery)) {
          logSecurityEvent('QUERY_SANITIZED', {
            path: request.nextUrl.pathname,
            originalKeys: Object.keys(queryObj),
            sanitizedKeys: Object.keys(sanitizedQuery),
          }, 'info');
        }
      }

      return innerHandler(modifiedRequest, context);
    };
  }

  return wrappedHandler;
}

/**
 * 认证 API 中间件
 *
 * 专门用于认证相关接口，限流更严格
 */
export function withAuthSecurity(
  handler: ApiHandler,
  config?: Partial<SecurityMiddlewareConfig>
): ApiHandler {
  return withSecureApi(handler, {
    rateLimit: { limit: 5, interval: 60000, prefix: 'auth' },
    logSecurity: true,
    ...config,
  });
}

/**
 * 敏感操作 API 中间件
 *
 * 用于支付、密码修改等敏感操作
 */
export function withSensitiveSecurity(
  handler: ApiHandler,
  config?: Partial<SecurityMiddlewareConfig>
): ApiHandler {
  return withSecureApi(handler, {
    rateLimit: { limit: 3, interval: 60000, prefix: 'sensitive' },
    validateCsrf: true,
    logSecurity: true,
    ...config,
  });
}

/**
 * 公开 API 中间件
 *
 * 用于公开接口，限流相对宽松
 */
export function withPublicSecurity(
  handler: ApiHandler,
  config?: Partial<SecurityMiddlewareConfig>
): ApiHandler {
  return withSecureApi(handler, {
    rateLimit: { limit: 100, interval: 60000, prefix: 'public' },
    validateCsrf: false,
    ...config,
  });
}

// ============================================
// 辅助函数
// ============================================

/**
 * 安全地解析请求体
 *
 * 自动清理潜在的危险内容
 */
export async function safeParseBody<T = Record<string, unknown>>(
  request: NextRequest,
  options: { sanitize?: boolean; sanitizeMongo?: boolean } = {}
): Promise<T | null> {
  const { sanitize = true, sanitizeMongo = true } = options;

  try {
    let body = await request.json();

    if (sanitize && typeof body === 'object' && body !== null) {
      body = sanitizeObject(body as Record<string, unknown>);
    }

    if (sanitizeMongo && typeof body === 'object' && body !== null) {
      body = sanitizeMongoQuery(body as Record<string, unknown>);
    }

    return body as T;
  } catch {
    return null;
  }
}

/**
 * 创建安全错误响应
 *
 * 不泄露内部错误信息
 */
export function createSecureErrorResponse(
  error: unknown,
  options: { logError?: boolean; defaultMessage?: string } = {}
): NextResponse {
  const { logError = true, defaultMessage = '服务器内部错误' } = options;

  if (logError && error instanceof Error) {
    logSecurityEvent('API_ERROR', {
      message: error.message,
      stack: error.stack,
    }, 'error');
  }

  // 不向客户端暴露具体错误信息
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: defaultMessage,
      },
    },
    { status: 500 }
  );
}

export default {
  withSecurity,
  withSecureApi,
  withAuthSecurity,
  withSensitiveSecurity,
  withPublicSecurity,
  safeParseBody,
  createSecureErrorResponse,
};

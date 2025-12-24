/**
 * 安全工具库
 *
 * 提供安全相关的工具函数和配置
 *
 * @example
 * ```ts
 * import { securityHeaders, sanitizeInput, validateCsrfToken } from '@/lib/security';
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ============================================
// 安全头配置
// ============================================

/**
 * 内容安全策略 (CSP) 配置
 *
 * 根据环境返回不同的 CSP 配置
 */
export function getContentSecurityPolicy(isDev: boolean = false): string {
  const policies: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Next.js 需要
      "'unsafe-eval'", // 开发模式需要
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://va.vercel-scripts.com',
    ],
    'style-src': ["'self'", "'unsafe-inline'"], // Tailwind CSS 需要
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
      "'self'",
      'https://www.google-analytics.com',
      'https://vitals.vercel-insights.com',
      'https://va.vercel-scripts.com',
      ...(isDev ? ['ws://localhost:*', 'http://localhost:*'] : []),
    ],
    'frame-ancestors': ["'self'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
  };

  // 开发模式放宽一些限制
  if (isDev) {
    policies['script-src'].push("'unsafe-eval'");
  }

  return Object.entries(policies)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * 安全响应头配置
 */
export interface SecurityHeaders {
  /** 内容安全策略 */
  'Content-Security-Policy'?: string;
  /** 防止 MIME 类型嗅探 */
  'X-Content-Type-Options': string;
  /** 防止点击劫持 */
  'X-Frame-Options': string;
  /** XSS 保护 (旧版浏览器) */
  'X-XSS-Protection': string;
  /** 引用策略 */
  'Referrer-Policy': string;
  /** 权限策略 */
  'Permissions-Policy': string;
  /** HTTPS 严格传输安全 */
  'Strict-Transport-Security'?: string;
}

/**
 * 获取安全响应头
 */
export function getSecurityHeaders(options: {
  isDev?: boolean;
  includeCSP?: boolean;
  includeHSTS?: boolean;
} = {}): SecurityHeaders {
  const { isDev = false, includeCSP = true, includeHSTS = !isDev } = options;

  const headers: SecurityHeaders = {
    // 防止 MIME 类型嗅探攻击
    'X-Content-Type-Options': 'nosniff',

    // 防止点击劫持
    'X-Frame-Options': 'SAMEORIGIN',

    // XSS 保护 (旧版浏览器)
    'X-XSS-Protection': '1; mode=block',

    // 控制 Referer 头信息
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // 限制浏览器功能
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
    ].join(', '),
  };

  // CSP (可选，因为某些功能可能需要调整)
  if (includeCSP) {
    headers['Content-Security-Policy'] = getContentSecurityPolicy(isDev);
  }

  // HSTS (仅生产环境)
  if (includeHSTS) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  return headers;
}

/**
 * 将安全头转换为 Next.js headers 配置格式
 */
export function securityHeadersForNextConfig(options?: Parameters<typeof getSecurityHeaders>[0]): Array<{ key: string; value: string }> {
  const headers = getSecurityHeaders(options);
  return Object.entries(headers)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ({ key, value: value as string }));
}

// ============================================
// CORS 配置
// ============================================

/**
 * CORS 配置选项
 */
export interface CorsOptions {
  /** 允许的来源 */
  allowedOrigins?: string[];
  /** 允许的方法 */
  allowedMethods?: string[];
  /** 允许的头 */
  allowedHeaders?: string[];
  /** 暴露的头 */
  exposedHeaders?: string[];
  /** 是否允许凭据 */
  credentials?: boolean;
  /** 预检请求缓存时间 (秒) */
  maxAge?: number;
}

/**
 * 默认 CORS 配置
 */
export const defaultCorsOptions: CorsOptions = {
  allowedOrigins: ['*'], // 生产环境应该限制具体域名
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400, // 24小时
};

/**
 * 获取 CORS 响应头
 */
export function getCorsHeaders(
  origin: string | null,
  options: CorsOptions = defaultCorsOptions
): Record<string, string> {
  const {
    allowedOrigins = ['*'],
    allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    exposedHeaders = [],
    credentials = true,
    maxAge = 86400,
  } = options;

  // 检查来源是否允许
  const isAllowed =
    allowedOrigins.includes('*') ||
    (origin && allowedOrigins.includes(origin));

  if (!isAllowed) {
    return {};
  }

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowedOrigins.includes('*') ? '*' : origin || '*',
    'Access-Control-Allow-Methods': allowedMethods.join(', '),
    'Access-Control-Allow-Headers': allowedHeaders.join(', '),
    'Access-Control-Max-Age': maxAge.toString(),
  };

  if (exposedHeaders.length > 0) {
    headers['Access-Control-Expose-Headers'] = exposedHeaders.join(', ');
  }

  // 如果允许凭据，不能使用 * 作为来源
  if (credentials && !allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

/**
 * CORS 中间件
 */
export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse | Response>,
  options?: CorsOptions
): (request: NextRequest) => Promise<NextResponse | Response> {
  return async (request: NextRequest) => {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin, options);

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 执行实际处理器
    const response = await handler(request);

    // 添加 CORS 头
    if (response instanceof NextResponse) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  };
}

// ============================================
// CSRF 保护
// ============================================

/**
 * 生成 CSRF Token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 验证 CSRF Token
 *
 * @example
 * ```ts
 * const headerToken = request.headers.get('x-csrf-token');
 * const cookieToken = request.cookies.get('csrf-token')?.value;
 *
 * if (!validateCsrfToken(headerToken, cookieToken)) {
 *   return new Response('Invalid CSRF token', { status: 403 });
 * }
 * ```
 */
export function validateCsrfToken(
  headerToken: string | null,
  cookieToken: string | null | undefined
): boolean {
  if (!headerToken || !cookieToken) {
    return false;
  }

  // 使用时间安全的比较防止时序攻击
  try {
    return crypto.timingSafeEqual(
      Buffer.from(headerToken),
      Buffer.from(cookieToken)
    );
  } catch {
    return false;
  }
}

/**
 * CSRF 保护中间件
 */
export function withCsrfProtection(
  handler: (request: NextRequest) => Promise<NextResponse | Response>,
  options: {
    /** 跳过检查的方法 */
    skipMethods?: string[];
    /** Cookie 名称 */
    cookieName?: string;
    /** Header 名称 */
    headerName?: string;
  } = {}
): (request: NextRequest) => Promise<NextResponse | Response> {
  const {
    skipMethods = ['GET', 'HEAD', 'OPTIONS'],
    cookieName = 'csrf-token',
    headerName = 'x-csrf-token',
  } = options;

  return async (request: NextRequest) => {
    // 跳过安全方法
    if (skipMethods.includes(request.method)) {
      return handler(request);
    }

    const headerToken = request.headers.get(headerName);
    const cookieToken = request.cookies.get(cookieName)?.value;

    if (!validateCsrfToken(headerToken, cookieToken)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'CSRF 令牌无效',
          },
        },
        { status: 403 }
      );
    }

    return handler(request);
  };
}

// ============================================
// 输入清理和验证
// ============================================

/**
 * HTML 特殊字符转义映射
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * 转义 HTML 特殊字符 (防止 XSS)
 *
 * @example
 * ```ts
 * const safe = escapeHtml('<script>alert("xss")</script>');
 * // '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
 * ```
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * 清理用户输入
 *
 * @example
 * ```ts
 * const clean = sanitizeInput('  <script>alert("xss")</script>  ');
 * // '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
 * ```
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return escapeHtml(input.trim());
}

/**
 * 深度清理对象中的所有字符串值
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };

  for (const key of Object.keys(result)) {
    const value = result[key];

    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeInput(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeInput(item)
          : item && typeof item === 'object'
            ? sanitizeObject(item as Record<string, unknown>)
            : item
      );
    }
  }

  return result;
}

/**
 * 移除潜在的 NoSQL 注入操作符
 *
 * MongoDB 注入防护
 *
 * @example
 * ```ts
 * const safe = sanitizeMongoQuery({ $where: 'malicious', name: 'test' });
 * // { name: 'test' }
 * ```
 */
export function sanitizeMongoQuery<T extends Record<string, unknown>>(query: T): T {
  const dangerousKeys = ['$where', '$regex', '$ne', '$gt', '$lt', '$gte', '$lte', '$in', '$nin', '$or', '$and', '$not', '$nor', '$exists', '$type', '$expr'];

  const result = { ...query };

  for (const key of Object.keys(result)) {
    // 移除危险的操作符
    if (dangerousKeys.includes(key)) {
      delete (result as Record<string, unknown>)[key];
      continue;
    }

    const value = result[key];

    // 递归处理嵌套对象
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeMongoQuery(value as Record<string, unknown>);
    }
  }

  return result;
}

/**
 * 验证并清理 URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * 验证并清理邮箱
 */
export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * 验证并清理手机号 (中国大陆)
 */
export function sanitizePhone(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');
  const phoneRegex = /^1[3-9]\d{9}$/;

  if (!phoneRegex.test(cleaned)) {
    return null;
  }

  return cleaned;
}

// ============================================
// 密码安全
// ============================================

/**
 * 密码强度等级
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * 检查密码强度
 */
export function checkPasswordStrength(password: string): {
  strength: PasswordStrength;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // 长度检查
  if (password.length < 8) {
    feedback.push('密码长度至少 8 个字符');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // 大写字母
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('建议包含大写字母');
  }

  // 小写字母
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('建议包含小写字母');
  }

  // 数字
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('建议包含数字');
  }

  // 特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('建议包含特殊字符');
  }

  // 常见密码检查
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('请勿使用常见密码');
  }

  // 评分转换为强度等级
  let strength: PasswordStrength;
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 3) {
    strength = 'fair';
  } else if (score <= 4) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return { strength, score, feedback };
}

/**
 * 生成安全的随机密码
 */
export function generateSecurePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + symbols;

  // 确保包含每种字符类型
  let password =
    lowercase[crypto.randomInt(lowercase.length)] +
    uppercase[crypto.randomInt(uppercase.length)] +
    numbers[crypto.randomInt(numbers.length)] +
    symbols[crypto.randomInt(symbols.length)];

  // 填充剩余长度
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }

  // 打乱顺序
  return password
    .split('')
    .sort(() => crypto.randomInt(3) - 1)
    .join('');
}

export default {
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
};

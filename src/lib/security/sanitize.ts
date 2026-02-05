/**
 * 安全工具库
 *
 * 提供 CORS、CSRF、输入清理等安全功能
 *
 * @module @/lib/security/sanitize
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ============================================
// 安全头配置
// ============================================

export function getContentSecurityPolicy(isDev: boolean = false): string {
  const policies: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://va.vercel-scripts.com',
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
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

  if (isDev) {
    policies['script-src'].push("'unsafe-eval'");
  }

  return Object.entries(policies)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security'?: string;
}

export function getSecurityHeaders(options: {
  isDev?: boolean;
  includeCSP?: boolean;
  includeHSTS?: boolean;
} = {}): SecurityHeaders {
  const { isDev = false, includeCSP = true, includeHSTS = !isDev } = options;

  const headers: SecurityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
    ].join(', '),
  };

  if (includeCSP) {
    headers['Content-Security-Policy'] = getContentSecurityPolicy(isDev);
  }

  if (includeHSTS) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  return headers;
}

export function securityHeadersForNextConfig(options?: Parameters<typeof getSecurityHeaders>[0]): Array<{ key: string; value: string }> {
  const headers = getSecurityHeaders(options);
  return Object.entries(headers)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ({ key, value: value as string }));
}

// ============================================
// CORS 配置
// ============================================

export interface CorsOptions {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export const defaultCorsOptions: CorsOptions = {
  allowedOrigins: ['*'],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400,
};

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

  if (credentials && !allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse | Response>,
  options?: CorsOptions
): (request: NextRequest) => Promise<NextResponse | Response> {
  return async (request: NextRequest) => {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin, options);

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const response = await handler(request);

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

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCsrfToken(
  headerToken: string | null,
  cookieToken: string | null | undefined
): boolean {
  if (!headerToken || !cookieToken) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(headerToken),
      Buffer.from(cookieToken)
    );
  } catch {
    return false;
  }
}

export function withCsrfProtection(
  handler: (request: NextRequest) => Promise<NextResponse | Response>,
  options: {
    skipMethods?: string[];
    cookieName?: string;
    headerName?: string;
  } = {}
): (request: NextRequest) => Promise<NextResponse | Response> {
  const {
    skipMethods = ['GET', 'HEAD', 'OPTIONS'],
    cookieName = 'csrf-token',
    headerName = 'x-csrf-token',
  } = options;

  return async (request: NextRequest) => {
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^1[3-9]\d{9}$/;
const HTML_ESCAPE_REGEX = /[&<>"'`=/]/g;

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

export function escapeHtml(str: string): string {
  return str.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char] || char);
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return escapeHtml(input.trim());
}

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

export function sanitizeMongoQuery<T extends Record<string, unknown>>(query: T): T {
  const dangerousKeys = ['$where', '$regex', '$ne', '$gt', '$lt', '$gte', '$lte', '$in', '$nin', '$or', '$and', '$not', '$nor', '$exists', '$type', '$expr'];

  const result = { ...query };

  for (const key of Object.keys(result)) {
    if (dangerousKeys.includes(key)) {
      delete (result as Record<string, unknown>)[key];
      continue;
    }

    const value = result[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeMongoQuery(value as Record<string, unknown>);
    }
  }

  return result;
}

export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmed)) {
    return null;
  }

  return trimmed;
}

export function sanitizePhone(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');

  if (!PHONE_REGEX.test(cleaned)) {
    return null;
  }

  return cleaned;
}

// ============================================
// 密码安全
// ============================================

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export function checkPasswordStrength(password: string): {
  strength: PasswordStrength;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('密码长度至少 8 个字符');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('建议包含大写字母');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('建议包含小写字母');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('建议包含数字');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('建议包含特殊字符');
  }

  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('请勿使用常见密码');
  }

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

export function generateSecurePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + symbols;

  let password =
    lowercase[crypto.randomInt(lowercase.length)] +
    uppercase[crypto.randomInt(uppercase.length)] +
    numbers[crypto.randomInt(numbers.length)] +
    symbols[crypto.randomInt(symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }

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

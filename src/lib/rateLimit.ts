/**
 * API 限流工具
 *
 * 提供基于内存的 API 限流功能，支持滑动窗口算法
 *
 * @example
 * ```ts
 * import { rateLimit, withRateLimit } from '@/lib/rateLimit';
 *
 * // 方式一：手动检查
 * const limiter = rateLimit({ interval: 60000, limit: 10 });
 * const result = await limiter.check(ip);
 * if (!result.success) {
 *   return new Response('Too Many Requests', { status: 429 });
 * }
 *
 * // 方式二：使用中间件
 * export const POST = withRateLimit(handler, { limit: 5, interval: 60000 });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// 类型定义
// ============================================

/**
 * 限流配置
 */
export interface RateLimitConfig {
  /** 时间窗口 (毫秒)，默认 60000 (1分钟) */
  interval?: number;
  /** 窗口内最大请求数，默认 10 */
  limit?: number;
  /** 唯一标识符前缀 */
  prefix?: string;
}

/**
 * 限流检查结果
 */
export interface RateLimitResult {
  /** 是否通过限流检查 */
  success: boolean;
  /** 剩余请求数 */
  remaining: number;
  /** 重置时间 (Unix 时间戳) */
  reset: number;
  /** 总限制数 */
  limit: number;
}

/**
 * 限流器接口
 */
export interface RateLimiter {
  /** 检查是否超过限制 */
  check: (identifier: string) => Promise<RateLimitResult>;
  /** 重置指定标识符的限制 */
  reset: (identifier: string) => void;
  /** 获取当前状态 */
  getStatus: (identifier: string) => RateLimitResult | null;
}

/**
 * 存储记录
 */
interface RateLimitRecord {
  /** 请求时间戳列表 */
  timestamps: number[];
  /** 窗口开始时间 */
  windowStart: number;
}

// ============================================
// 内存存储
// ============================================

/**
 * 内存存储的限流记录
 */
const store = new Map<string, RateLimitRecord>();

/**
 * 清理过期记录的间隔 (5分钟)
 */
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * 最大存储记录数 (防止内存泄漏)
 */
const MAX_STORE_SIZE = 10000;

/**
 * 定期清理过期记录
 */
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup(interval: number) {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    const expireTime = interval * 2; // 保留两个窗口周期的数据

    for (const [key, record] of store.entries()) {
      if (now - record.windowStart > expireTime) {
        store.delete(key);
      }
    }

    // 如果存储过大，删除最旧的记录
    if (store.size > MAX_STORE_SIZE) {
      const entries = Array.from(store.entries());
      entries.sort((a, b) => a[1].windowStart - b[1].windowStart);
      const toDelete = entries.slice(0, store.size - MAX_STORE_SIZE);
      toDelete.forEach(([key]) => store.delete(key));
    }
  }, CLEANUP_INTERVAL);

  // 确保不阻止进程退出
  cleanupTimer.unref?.();
}

// ============================================
// 限流器实现
// ============================================

/**
 * 创建限流器
 *
 * 使用滑动窗口算法进行限流
 *
 * @example
 * ```ts
 * const limiter = rateLimit({
 *   interval: 60000, // 1分钟
 *   limit: 10,       // 最多10次请求
 * });
 *
 * const result = await limiter.check('user-123');
 * console.log(result.remaining); // 剩余请求数
 * ```
 */
export function rateLimit(config: RateLimitConfig = {}): RateLimiter {
  const { interval = 60000, limit = 10, prefix = 'rl' } = config;

  // 启动清理定时器
  startCleanup(interval);

  /**
   * 生成存储键
   */
  const getKey = (identifier: string): string => `${prefix}:${identifier}`;

  /**
   * 检查并更新限流状态
   */
  const check = async (identifier: string): Promise<RateLimitResult> => {
    const key = getKey(identifier);
    const now = Date.now();
    const windowStart = now - interval;

    let record = store.get(key);

    if (!record) {
      record = {
        timestamps: [],
        windowStart: now,
      };
      store.set(key, record);
    }

    // 过滤掉窗口外的请求
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    // 计算剩余请求数
    const remaining = Math.max(0, limit - record.timestamps.length);
    const reset = Math.ceil((record.timestamps[0] || now) + interval);

    // 检查是否超过限制
    if (record.timestamps.length >= limit) {
      return {
        success: false,
        remaining: 0,
        reset,
        limit,
      };
    }

    // 记录本次请求
    record.timestamps.push(now);
    record.windowStart = now;

    return {
      success: true,
      remaining: remaining - 1,
      reset,
      limit,
    };
  };

  /**
   * 重置限流状态
   */
  const reset = (identifier: string): void => {
    const key = getKey(identifier);
    store.delete(key);
  };

  /**
   * 获取当前状态（不计入请求）
   */
  const getStatus = (identifier: string): RateLimitResult | null => {
    const key = getKey(identifier);
    const record = store.get(key);

    if (!record) return null;

    const now = Date.now();
    const windowStart = now - interval;
    const validTimestamps = record.timestamps.filter((ts) => ts > windowStart);

    return {
      success: validTimestamps.length < limit,
      remaining: Math.max(0, limit - validTimestamps.length),
      reset: Math.ceil((validTimestamps[0] || now) + interval),
      limit,
    };
  };

  return { check, reset, getStatus };
}

// ============================================
// 预设限流器
// ============================================

/**
 * API 通用限流器 (每分钟 60 次)
 */
export const apiLimiter = rateLimit({
  interval: 60000,
  limit: 60,
  prefix: 'api',
});

/**
 * 认证接口限流器 (每分钟 5 次)
 */
export const authLimiter = rateLimit({
  interval: 60000,
  limit: 5,
  prefix: 'auth',
});

/**
 * 验证码发送限流器 (每分钟 1 次)
 */
export const codeLimiter = rateLimit({
  interval: 60000,
  limit: 1,
  prefix: 'code',
});

/**
 * 严格限流器 (每分钟 3 次，用于敏感操作)
 */
export const strictLimiter = rateLimit({
  interval: 60000,
  limit: 3,
  prefix: 'strict',
});

// ============================================
// 中间件
// ============================================

/**
 * 从请求中获取客户端标识符
 */
export function getClientIdentifier(request: NextRequest): string {
  // 优先使用 X-Forwarded-For (代理后的真实 IP)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // 其次使用 X-Real-IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // 最后使用连接 IP (可能是代理服务器 IP)
  // Next.js 15 中 ip 属性可能不存在，使用可选链访问
  return (request as NextRequest & { ip?: string }).ip || 'unknown';
}

/**
 * 限流响应头
 */
function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}

/**
 * 限流中间件配置
 */
export interface RateLimitMiddlewareConfig extends RateLimitConfig {
  /** 自定义标识符获取函数 */
  getIdentifier?: (request: NextRequest) => string;
  /** 自定义超限响应 */
  onRateLimit?: (request: NextRequest, result: RateLimitResult) => NextResponse;
}

/**
 * 限流中间件
 *
 * @example
 * ```ts
 * // 基础用法
 * export const POST = withRateLimit(handler);
 *
 * // 自定义配置
 * export const POST = withRateLimit(handler, {
 *   limit: 5,
 *   interval: 60000,
 *   getIdentifier: (req) => req.headers.get('authorization') || getClientIdentifier(req),
 * });
 * ```
 */
export function withRateLimit<T extends NextRequest>(
  handler: (request: T, context?: unknown) => Promise<NextResponse | Response>,
  config: RateLimitMiddlewareConfig = {}
): (request: T, context?: unknown) => Promise<NextResponse | Response> {
  const {
    getIdentifier = getClientIdentifier,
    onRateLimit,
    ...rateLimitConfig
  } = config;

  const limiter = rateLimit(rateLimitConfig);

  return async (request: T, context?: unknown) => {
    const identifier = getIdentifier(request as NextRequest);
    const result = await limiter.check(identifier);

    // 添加限流响应头
    const headers = getRateLimitHeaders(result);

    if (!result.success) {
      // 超过限制
      if (onRateLimit) {
        return onRateLimit(request as NextRequest, result);
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '请求过于频繁，请稍后再试',
          },
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 执行原始处理器
    const response = await handler(request, context);

    // 添加限流头到响应
    if (response instanceof NextResponse) {
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  };
}

/**
 * 组合多个限流器
 *
 * @example
 * ```ts
 * export const POST = withMultiRateLimit(handler, [
 *   { limiter: apiLimiter },
 *   { limiter: authLimiter, getIdentifier: (req) => req.headers.get('user-id') || '' },
 * ]);
 * ```
 */
export function withMultiRateLimit<T extends NextRequest>(
  handler: (request: T, context?: unknown) => Promise<NextResponse | Response>,
  limiters: Array<{
    limiter: RateLimiter;
    getIdentifier?: (request: NextRequest) => string;
  }>
): (request: T, context?: unknown) => Promise<NextResponse | Response> {
  return async (request: T, context?: unknown) => {
    for (const { limiter, getIdentifier = getClientIdentifier } of limiters) {
      const identifier = getIdentifier(request as NextRequest);
      const result = await limiter.check(identifier);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: '请求过于频繁，请稍后再试',
            },
          },
          {
            status: 429,
            headers: {
              ...getRateLimitHeaders(result),
              'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }
    }

    return handler(request, context);
  };
}

export default rateLimit;

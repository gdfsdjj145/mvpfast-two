/**
 * API 请求日志中间件
 *
 * 用于 Next.js API 路由的请求日志记录
 *
 * @example
 * ```ts
 * import { withRequestLogging } from '@/lib/api-logger';
 *
 * export const GET = withRequestLogging(async (request) => {
 *   // 处理请求...
 *   return NextResponse.json({ data: 'ok' });
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { apiLogger, createChildLogger, logApiRequest, logApiResponse, logApiError } from './logger';

/**
 * 生成请求 ID
 */
export function generateRequestId(): string {
  return nanoid(12);
}

/**
 * 从请求中提取客户端信息
 */
export function extractClientInfo(request: NextRequest): {
  ip: string;
  userAgent: string;
} {
  // 获取真实 IP（考虑代理）
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ip, userAgent };
}

/**
 * API 路由处理器类型
 */
type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse | Response>;

/**
 * API 请求日志中间件
 *
 * 自动记录请求和响应日志，包括请求时间、状态码、耗时等
 *
 * @example
 * ```ts
 * // 基础用法
 * export const GET = withRequestLogging(async (request) => {
 *   const data = await fetchData();
 *   return NextResponse.json({ data });
 * });
 *
 * // 与错误处理中间件组合
 * export const POST = withRequestLogging(
 *   withErrorHandler(async (request) => {
 *     const body = await request.json();
 *     return NextResponse.json({ success: true });
 *   })
 * );
 * ```
 */
export function withRequestLogging(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { ip, userAgent } = extractClientInfo(request);
    const method = request.method;
    const url = request.nextUrl.pathname;

    // 创建带请求 ID 的日志实例
    const reqLogger = createChildLogger({ requestId });

    // 记录请求开始
    logApiRequest({
      method,
      url,
      ip,
      userAgent,
    });

    try {
      // 执行实际的路由处理器
      const response = await handler(request, context);
      const duration = Date.now() - startTime;

      // 获取响应状态码
      const statusCode = response instanceof NextResponse ? response.status : 200;

      // 记录响应
      logApiResponse({
        method,
        url,
        statusCode,
        duration,
        ip,
        userAgent,
      });

      // 添加请求 ID 到响应头
      if (response instanceof NextResponse) {
        response.headers.set('X-Request-Id', requestId);
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // 记录错误
      logApiError({
        method,
        url,
        statusCode: 500,
        duration,
        ip,
        userAgent,
        error: errorMessage,
      });

      // 记录详细错误信息
      reqLogger.error({ error }, 'Request failed');

      // 重新抛出错误，让上层错误处理器处理
      throw error;
    }
  };
}

/**
 * 请求日志配置选项
 */
export interface RequestLoggingOptions {
  /** 是否记录请求体 */
  logBody?: boolean;
  /** 是否记录响应体 */
  logResponse?: boolean;
  /** 跳过记录的路径 */
  skipPaths?: string[];
  /** 敏感字段（会被脱敏） */
  sensitiveFields?: string[];
}

/**
 * 高级请求日志中间件
 *
 * 支持更多配置选项
 */
export function withAdvancedRequestLogging(
  handler: RouteHandler,
  options: RequestLoggingOptions = {}
): RouteHandler {
  const {
    logBody = false,
    logResponse = false,
    skipPaths = [],
    sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'],
  } = options;

  return async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const url = request.nextUrl.pathname;

    // 检查是否跳过日志
    if (skipPaths.some((path) => url.startsWith(path))) {
      return handler(request, context);
    }

    const startTime = Date.now();
    const requestId = generateRequestId();
    const { ip, userAgent } = extractClientInfo(request);
    const method = request.method;

    // 创建带请求 ID 的日志实例
    const reqLogger = createChildLogger({ requestId });

    // 准备请求日志数据
    const logData: Record<string, unknown> = {
      method,
      url,
      ip,
      userAgent,
    };

    // 可选记录请求体
    if (logBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const clonedRequest = request.clone();
        const body = await clonedRequest.json();
        logData.body = maskSensitiveData(body, sensitiveFields);
      } catch {
        // 忽略解析错误
      }
    }

    reqLogger.info(logData, `${method} ${url} - Request started`);

    try {
      const response = await handler(request, context);
      const duration = Date.now() - startTime;
      const statusCode = response instanceof NextResponse ? response.status : 200;

      const responseLogData: Record<string, unknown> = {
        method,
        url,
        statusCode,
        duration,
      };

      // 可选记录响应体
      if (logResponse && response instanceof NextResponse) {
        try {
          const clonedResponse = response.clone();
          const responseBody = await clonedResponse.json();
          responseLogData.response = maskSensitiveData(responseBody, sensitiveFields);
        } catch {
          // 忽略解析错误
        }
      }

      const level = statusCode >= 400 ? 'warn' : 'info';
      reqLogger[level](responseLogData, `${method} ${url} ${statusCode} - ${duration}ms`);

      if (response instanceof NextResponse) {
        response.headers.set('X-Request-Id', requestId);
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      reqLogger.error(
        {
          method,
          url,
          duration,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        },
        `${method} ${url} - Request failed`
      );

      throw error;
    }
  };
}

/**
 * 脱敏敏感数据
 */
function maskSensitiveData(
  data: unknown,
  sensitiveFields: string[]
): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item, sensitiveFields));
  }

  const masked: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      masked[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value, sensitiveFields);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * 简单的控制台日志中间件（用于开发环境调试）
 */
export function withConsoleLogging(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    const startTime = Date.now();
    const method = request.method;
    const url = request.nextUrl.pathname;

    console.log(`[${new Date().toISOString()}] ${method} ${url} - Started`);

    try {
      const response = await handler(request, context);
      const duration = Date.now() - startTime;
      const statusCode = response instanceof NextResponse ? response.status : 200;

      console.log(`[${new Date().toISOString()}] ${method} ${url} ${statusCode} - ${duration}ms`);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${new Date().toISOString()}] ${method} ${url} ERROR - ${duration}ms`, error);
      throw error;
    }
  };
}

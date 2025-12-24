/**
 * API 路由统一错误处理中间件
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppError, ErrorCode, isAppError, toAppError } from './errors';

/**
 * API 响应格式
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  code?: ErrorCode;
  timestamp?: string;
}

/**
 * 创建成功响应
 */
export function successResponse<T>(
  data: T,
  message: string = '操作成功',
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * 创建错误响应
 */
export function errorResponse(
  error: AppError,
  includeDetails: boolean = process.env.NODE_ENV === 'development'
): NextResponse<ApiResponse<null>> {
  const response: ApiResponse<null> = {
    success: false,
    data: null,
    message: error.message,
    code: error.code,
    timestamp: error.timestamp.toISOString(),
  };

  // 开发环境下包含详细错误信息
  if (includeDetails && error.details) {
    (response as ApiResponse<null> & { details: unknown }).details = error.details;
  }

  return NextResponse.json(response, { status: error.httpStatus });
}

/**
 * API 路由处理器类型
 */
type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse | Response>;

/**
 * 日志级别
 */
type LogLevel = 'error' | 'warn' | 'info';

/**
 * 日志记录函数
 */
function logError(error: AppError, request: NextRequest, level: LogLevel = 'error'): void {
  const logData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    errorCode: error.code,
    errorMessage: error.message,
    httpStatus: error.httpStatus,
    details: error.details,
  };

  // 根据日志级别记录
  switch (level) {
    case 'warn':
      console.warn('[API Warning]', JSON.stringify(logData, null, 2));
      break;
    case 'info':
      console.info('[API Info]', JSON.stringify(logData, null, 2));
      break;
    default:
      console.error('[API Error]', JSON.stringify(logData, null, 2));
  }
}

/**
 * 根据错误码决定日志级别
 */
function getLogLevel(code: ErrorCode): LogLevel {
  // 客户端错误使用 warn 级别
  if (code >= 1000 && code < 2000) {
    return 'warn'; // 通用错误
  }
  if (code >= 2000 && code < 3000) {
    return 'warn'; // 认证错误
  }
  if (code >= 3000 && code < 4000) {
    return 'info'; // 业务错误
  }
  // 外部服务错误和服务器错误使用 error 级别
  return 'error';
}

/**
 * API 路由包装器 - 统一错误处理
 *
 * @example
 * ```ts
 * import { withErrorHandler, successResponse } from '@/lib/api-handler';
 *
 * export const GET = withErrorHandler(async (request) => {
 *   const data = await fetchData();
 *   return successResponse(data, '获取数据成功');
 * });
 * ```
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // 转换为 AppError
      const appError = toAppError(error);

      // 记录错误日志
      const logLevel = getLogLevel(appError.code);
      logError(appError, request, logLevel);

      // 返回错误响应
      return errorResponse(appError);
    }
  };
}

/**
 * 验证请求体 - 确保必填字段存在
 *
 * @example
 * ```ts
 * const data = await validateRequestBody(request, ['name', 'email']);
 * ```
 */
export async function validateRequestBody<T extends Record<string, unknown>>(
  request: NextRequest,
  requiredFields: string[]
): Promise<T> {
  let body: T;

  try {
    body = await request.json();
  } catch {
    throw new AppError(ErrorCode.VALIDATION_ERROR, '请求体格式错误，请提供有效的 JSON');
  }

  if (!body || typeof body !== 'object') {
    throw new AppError(ErrorCode.VALIDATION_ERROR, '请求体不能为空');
  }

  const missingFields: string[] = [];
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `缺少必填字段: ${missingFields.join(', ')}`,
      { missingFields }
    );
  }

  return body;
}

/**
 * 获取分页参数
 */
export function getPaginationParams(
  request: NextRequest,
  defaults: { skip?: number; take?: number } = {}
): { skip: number; take: number } {
  const searchParams = request.nextUrl.searchParams;

  const skip = parseInt(searchParams.get('skip') || String(defaults.skip ?? 0), 10);
  const take = parseInt(searchParams.get('take') || String(defaults.take ?? 10), 10);

  // 验证参数合法性
  if (isNaN(skip) || skip < 0) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'skip 参数必须是非负整数');
  }

  if (isNaN(take) || take < 1 || take > 100) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'take 参数必须是 1-100 之间的整数');
  }

  return { skip, take };
}

/**
 * 获取查询参数
 */
export function getQueryParam(
  request: NextRequest,
  key: string,
  required: boolean = false
): string | null {
  const value = request.nextUrl.searchParams.get(key);

  if (required && !value) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, `缺少必填参数: ${key}`);
  }

  return value;
}

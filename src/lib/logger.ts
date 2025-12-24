/**
 * 日志系统
 *
 * 基于 Pino 的统一日志工具，支持不同环境的日志级别配置
 *
 * @example
 * ```ts
 * import { logger } from '@/lib/logger';
 *
 * logger.info('用户登录成功', { userId: '123' });
 * logger.error('支付失败', { orderId: '456', error: err.message });
 * ```
 */

import pino, { Logger, LoggerOptions } from 'pino';

/**
 * 日志级别
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * 日志上下文类型
 */
export interface LogContext {
  /** 请求 ID */
  requestId?: string;
  /** 用户 ID */
  userId?: string;
  /** 会话 ID */
  sessionId?: string;
  /** 其他上下文数据 */
  [key: string]: unknown;
}

/**
 * 获取当前环境
 */
const getEnvironment = (): string => {
  return process.env.NODE_ENV || 'development';
};

/**
 * 根据环境获取日志级别
 */
const getLogLevel = (): LogLevel => {
  const env = getEnvironment();

  // 可以通过环境变量覆盖
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL as LogLevel;
  }

  switch (env) {
    case 'production':
      return 'info';
    case 'test':
      return 'error';
    case 'development':
    default:
      return 'debug';
  }
};

/**
 * 检查是否安装了 pino-pretty
 */
const hasPinoPretty = (): boolean => {
  try {
    require.resolve('pino-pretty');
    return true;
  } catch {
    return false;
  }
};

/**
 * 创建 Pino 日志配置
 */
const createLoggerOptions = (): LoggerOptions => {
  const env = getEnvironment();
  const level = getLogLevel();

  const baseOptions: LoggerOptions = {
    level,
    // 基础字段
    base: {
      env,
      pid: process.pid,
    },
    // 时间戳格式
    timestamp: pino.stdTimeFunctions.isoTime,
    // 格式化选项
    formatters: {
      level: (label) => ({ level: label }),
      bindings: (bindings) => ({
        pid: bindings.pid,
        host: bindings.hostname,
      }),
    },
  };

  // 开发环境尝试使用 pino-pretty 格式化输出
  if (env === 'development' && hasPinoPretty()) {
    return {
      ...baseOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    };
  }

  // 生产环境或无 pino-pretty 时输出 JSON 格式
  return baseOptions;
};

/**
 * 创建基础日志实例
 */
const createLogger = (): Logger => {
  return pino(createLoggerOptions());
};

/**
 * 主日志实例
 */
export const logger = createLogger();

/**
 * 创建带上下文的子日志实例
 *
 * @example
 * ```ts
 * const reqLogger = createChildLogger({ requestId: 'abc123', userId: 'user456' });
 * reqLogger.info('处理请求');
 * ```
 */
export function createChildLogger(context: LogContext): Logger {
  return logger.child(context);
}

/**
 * 创建带模块名的日志实例
 *
 * @example
 * ```ts
 * const authLogger = createModuleLogger('auth');
 * authLogger.info('用户认证成功');
 * ```
 */
export function createModuleLogger(module: string): Logger {
  return logger.child({ module });
}

/**
 * API 请求日志记录器
 */
export const apiLogger = createModuleLogger('api');

/**
 * 数据库操作日志记录器
 */
export const dbLogger = createModuleLogger('db');

/**
 * 认证日志记录器
 */
export const authLogger = createModuleLogger('auth');

/**
 * 支付日志记录器
 */
export const paymentLogger = createModuleLogger('payment');

/**
 * 记录 API 请求日志
 */
export interface ApiLogData {
  method: string;
  url: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
  error?: string;
}

/**
 * 记录 API 请求开始
 */
export function logApiRequest(data: Omit<ApiLogData, 'statusCode' | 'duration'>): void {
  apiLogger.info(
    {
      type: 'request',
      ...data,
    },
    `${data.method} ${data.url}`
  );
}

/**
 * 记录 API 请求完成
 */
export function logApiResponse(data: ApiLogData): void {
  const level = data.statusCode && data.statusCode >= 400 ? 'warn' : 'info';

  apiLogger[level](
    {
      type: 'response',
      ...data,
    },
    `${data.method} ${data.url} ${data.statusCode} ${data.duration}ms`
  );
}

/**
 * 记录 API 错误
 */
export function logApiError(data: ApiLogData & { error: string }): void {
  apiLogger.error(
    {
      type: 'error',
      ...data,
    },
    `${data.method} ${data.url} - ${data.error}`
  );
}

/**
 * 记录数据库操作
 */
export interface DbLogData {
  operation: 'find' | 'create' | 'update' | 'delete' | 'query';
  collection: string;
  duration?: number;
  success: boolean;
  error?: string;
}

export function logDbOperation(data: DbLogData): void {
  const level = data.success ? 'debug' : 'error';
  dbLogger[level](
    {
      type: 'db_operation',
      ...data,
    },
    `${data.operation} ${data.collection} ${data.success ? 'success' : 'failed'}`
  );
}

/**
 * 性能日志 - 记录操作耗时
 */
export function logPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, unknown>
): void {
  const level = duration > 1000 ? 'warn' : 'debug';
  logger[level](
    {
      type: 'performance',
      operation,
      duration,
      ...metadata,
    },
    `${operation} took ${duration}ms`
  );
}

/**
 * 计时器 - 用于测量操作耗时
 *
 * @example
 * ```ts
 * const timer = createTimer('fetchUsers');
 * await fetchUsers();
 * timer.end(); // 自动记录耗时
 * ```
 */
export function createTimer(operation: string, metadata?: Record<string, unknown>) {
  const startTime = Date.now();

  return {
    /** 结束计时并记录 */
    end: () => {
      const duration = Date.now() - startTime;
      logPerformance(operation, duration, metadata);
      return duration;
    },
    /** 获取当前耗时 */
    elapsed: () => Date.now() - startTime,
  };
}

/**
 * 安全日志 - 记录安全相关事件
 */
export function logSecurityEvent(
  event: string,
  data: Record<string, unknown>,
  level: 'info' | 'warn' | 'error' = 'info'
): void {
  logger[level](
    {
      type: 'security',
      event,
      ...data,
    },
    `Security: ${event}`
  );
}

/**
 * 业务日志 - 记录业务事件
 */
export function logBusinessEvent(
  event: string,
  data: Record<string, unknown>
): void {
  logger.info(
    {
      type: 'business',
      event,
      ...data,
    },
    `Business: ${event}`
  );
}

export default logger;

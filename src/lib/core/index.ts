/**
 * 核心模块
 *
 * 包含错误类型、日志系统、数据库客户端
 *
 * @module @/lib/core
 */

// 错误类型
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
} from './errors';

// 日志系统
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
  type LogLevel,
  type LogContext,
  type ApiLogData,
  type DbLogData,
} from './logger';

// 数据库客户端
export { default as prisma } from './prisma';

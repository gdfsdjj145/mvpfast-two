/**
 * 自定义错误类型
 */

// 错误代码枚举
export enum ErrorCode {
  // 通用错误 (1xxx)
  UNKNOWN = 1000,
  VALIDATION_ERROR = 1001,
  NOT_FOUND = 1002,

  // 认证错误 (2xxx)
  UNAUTHORIZED = 2001,
  FORBIDDEN = 2002,
  TOKEN_EXPIRED = 2003,
  INVALID_CREDENTIALS = 2004,

  // 业务错误 (3xxx)
  ORDER_NOT_FOUND = 3001,
  ORDER_ALREADY_PAID = 3002,
  PAYMENT_FAILED = 3003,
  USER_NOT_FOUND = 3004,

  // 外部服务错误 (4xxx)
  WECHAT_API_ERROR = 4001,
  SMS_SEND_FAILED = 4002,
  EMAIL_SEND_FAILED = 4003,

  // 服务器错误 (5xxx)
  DATABASE_ERROR = 5001,
  INTERNAL_ERROR = 5002,
}

// 错误代码对应的 HTTP 状态码
const errorCodeToHttpStatus: Record<ErrorCode, number> = {
  [ErrorCode.UNKNOWN]: 500,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.ORDER_NOT_FOUND]: 404,
  [ErrorCode.ORDER_ALREADY_PAID]: 400,
  [ErrorCode.PAYMENT_FAILED]: 400,
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.WECHAT_API_ERROR]: 502,
  [ErrorCode.SMS_SEND_FAILED]: 502,
  [ErrorCode.EMAIL_SEND_FAILED]: 502,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.INTERNAL_ERROR]: 500,
};

// 错误代码对应的默认消息
const errorCodeToMessage: Record<ErrorCode, string> = {
  [ErrorCode.UNKNOWN]: '未知错误',
  [ErrorCode.VALIDATION_ERROR]: '参数验证失败',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.UNAUTHORIZED]: '未授权访问',
  [ErrorCode.FORBIDDEN]: '禁止访问',
  [ErrorCode.TOKEN_EXPIRED]: '登录已过期',
  [ErrorCode.INVALID_CREDENTIALS]: '用户名或密码错误',
  [ErrorCode.ORDER_NOT_FOUND]: '订单不存在',
  [ErrorCode.ORDER_ALREADY_PAID]: '订单已支付',
  [ErrorCode.PAYMENT_FAILED]: '支付失败',
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.WECHAT_API_ERROR]: '微信接口调用失败',
  [ErrorCode.SMS_SEND_FAILED]: '短信发送失败',
  [ErrorCode.EMAIL_SEND_FAILED]: '邮件发送失败',
  [ErrorCode.DATABASE_ERROR]: '数据库错误',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',
};

/**
 * 应用错误基类
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly details?: unknown;
  public readonly timestamp: Date;

  constructor(
    code: ErrorCode = ErrorCode.UNKNOWN,
    message?: string,
    details?: unknown
  ) {
    super(message || errorCodeToMessage[code]);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = errorCodeToHttpStatus[code];
    this.details = details;
    this.timestamp = new Date();

    // 保持正确的堆栈跟踪
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      httpStatus: this.httpStatus,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(ErrorCode.VALIDATION_ERROR, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * 未找到错误
 */
export class NotFoundError extends AppError {
  constructor(resource: string = '资源') {
    super(ErrorCode.NOT_FOUND, `${resource}不存在`);
    this.name = 'NotFoundError';
  }
}

/**
 * 未授权错误
 */
export class UnauthorizedError extends AppError {
  constructor(message?: string) {
    super(ErrorCode.UNAUTHORIZED, message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 禁止访问错误
 */
export class ForbiddenError extends AppError {
  constructor(message?: string) {
    super(ErrorCode.FORBIDDEN, message);
    this.name = 'ForbiddenError';
  }
}

/**
 * 数据库错误
 */
export class DatabaseError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(ErrorCode.DATABASE_ERROR, message, details);
    this.name = 'DatabaseError';
  }
}

/**
 * 支付错误
 */
export class PaymentError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(ErrorCode.PAYMENT_FAILED, message, details);
    this.name = 'PaymentError';
  }
}

/**
 * 判断是否为 AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 从未知错误创建 AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(ErrorCode.INTERNAL_ERROR, error.message);
  }

  return new AppError(ErrorCode.UNKNOWN, String(error));
}

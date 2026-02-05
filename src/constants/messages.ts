/**
 * 提示信息常量
 *
 * 集中管理应用中的所有提示文案
 *
 * @example
 * ```ts
 * import { MESSAGES } from '@/constants';
 *
 * toast.success(MESSAGES.SUCCESS.SAVE);
 * toast.error(MESSAGES.ERROR.NETWORK);
 * ```
 */

/**
 * 成功提示
 */
export const SUCCESS_MESSAGES = {
  /** 保存成功 */
  SAVE: '保存成功',
  /** 提交成功 */
  SUBMIT: '提交成功',
  /** 创建成功 */
  CREATE: '创建成功',
  /** 更新成功 */
  UPDATE: '更新成功',
  /** 删除成功 */
  DELETE: '删除成功',
  /** 操作成功 */
  OPERATION: '操作成功',
  /** 复制成功 */
  COPY: '复制成功',
  /** 上传成功 */
  UPLOAD: '上传成功',
  /** 下载成功 */
  DOWNLOAD: '下载成功',
  /** 发送成功 */
  SEND: '发送成功',
  /** 登录成功 */
  LOGIN: '登录成功',
  /** 登出成功 */
  LOGOUT: '已安全退出',
  /** 注册成功 */
  REGISTER: '注册成功',
  /** 支付成功 */
  PAYMENT: '支付成功',
} as const;

/**
 * 错误提示
 */
export const ERROR_MESSAGES = {
  /** 网络错误 */
  NETWORK: '网络连接失败，请检查网络设置',
  /** 服务器错误 */
  SERVER: '服务器繁忙，请稍后重试',
  /** 请求超时 */
  TIMEOUT: '请求超时，请稍后重试',
  /** 未授权 */
  UNAUTHORIZED: '登录已过期，请重新登录',
  /** 禁止访问 */
  FORBIDDEN: '没有权限执行此操作',
  /** 资源不存在 */
  NOT_FOUND: '请求的资源不存在',
  /** 参数错误 */
  INVALID_PARAMS: '请求参数错误',
  /** 未知错误 */
  UNKNOWN: '发生未知错误，请稍后重试',
  /** 操作失败 */
  OPERATION_FAILED: '操作失败，请稍后重试',
  /** 上传失败 */
  UPLOAD_FAILED: '上传失败，请重试',
  /** 下载失败 */
  DOWNLOAD_FAILED: '下载失败，请重试',
  /** 支付失败 */
  PAYMENT_FAILED: '支付失败，请重试',
} as const;

/**
 * 警告提示
 */
export const WARNING_MESSAGES = {
  /** 未保存的更改 */
  UNSAVED_CHANGES: '您有未保存的更改，确定要离开吗？',
  /** 确认删除 */
  CONFIRM_DELETE: '确定要删除吗？此操作不可恢复',
  /** 确认提交 */
  CONFIRM_SUBMIT: '确定要提交吗？',
  /** 会话即将过期 */
  SESSION_EXPIRING: '您的登录状态即将过期，请重新登录',
} as const;

/**
 * 信息提示
 */
export const INFO_MESSAGES = {
  /** 加载中 */
  LOADING: '加载中...',
  /** 处理中 */
  PROCESSING: '处理中，请稍候...',
  /** 提交中 */
  SUBMITTING: '提交中...',
  /** 上传中 */
  UPLOADING: '上传中...',
  /** 下载中 */
  DOWNLOADING: '下载中...',
  /** 无数据 */
  NO_DATA: '暂无数据',
  /** 无更多数据 */
  NO_MORE_DATA: '没有更多数据了',
  /** 请先登录 */
  PLEASE_LOGIN: '请先登录',
} as const;

/**
 * 验证错误信息
 */
export const VALIDATION_MESSAGES = {
  /** 必填项 */
  REQUIRED: '此字段为必填项',
  /** 邮箱格式 */
  EMAIL_INVALID: '请输入有效的邮箱地址',
  /** 手机号格式 */
  PHONE_INVALID: '请输入有效的手机号',
  /** 密码长度 */
  PASSWORD_LENGTH: '密码长度应为 8-128 个字符',
  /** 密码格式 */
  PASSWORD_FORMAT: '密码需包含大小写字母和数字',
  /** 密码不匹配 */
  PASSWORD_MISMATCH: '两次输入的密码不一致',
  /** 验证码格式 */
  CODE_INVALID: '请输入 6 位验证码',
  /** 验证码已过期 */
  CODE_EXPIRED: '验证码已过期，请重新获取',
  /** 用户名长度 */
  USERNAME_LENGTH: '用户名长度应为 2-20 个字符',
  /** URL 格式 */
  URL_INVALID: '请输入有效的 URL 地址',
  /** 金额格式 */
  AMOUNT_INVALID: '请输入有效的金额',
  /** 数字格式 */
  NUMBER_INVALID: '请输入有效的数字',
  /** 文件过大 */
  FILE_TOO_LARGE: '文件大小不能超过 10MB',
  /** 文件类型 */
  FILE_TYPE_INVALID: '不支持的文件类型',
} as const;

/**
 * 认证相关信息
 */
export const AUTH_MESSAGES = {
  /** 登录失败 */
  LOGIN_FAILED: '登录失败，请检查账号密码',
  /** 账号不存在 */
  ACCOUNT_NOT_FOUND: '账号不存在',
  /** 密码错误 */
  PASSWORD_WRONG: '密码错误',
  /** 账号已存在 */
  ACCOUNT_EXISTS: '该账号已被注册',
  /** 验证码发送成功 */
  CODE_SENT: '验证码已发送',
  /** 验证码发送失败 */
  CODE_SEND_FAILED: '验证码发送失败，请稍后重试',
  /** 请先获取验证码 */
  GET_CODE_FIRST: '请先获取验证码',
  /** 验证码错误 */
  CODE_WRONG: '验证码错误',
} as const;

/**
 * 订单相关信息
 */
export const ORDER_MESSAGES = {
  /** 订单创建成功 */
  CREATE_SUCCESS: '订单创建成功',
  /** 订单创建失败 */
  CREATE_FAILED: '订单创建失败',
  /** 订单不存在 */
  NOT_FOUND: '订单不存在',
  /** 订单已支付 */
  ALREADY_PAID: '订单已支付',
  /** 订单已取消 */
  CANCELLED: '订单已取消',
  /** 订单已过期 */
  EXPIRED: '订单已过期',
  /** 正在查询订单状态 */
  QUERYING: '正在查询订单状态...',
} as const;

/**
 * 支付相关信息
 */
export const PAYMENT_MESSAGES = {
  /** 支付中 */
  PROCESSING: '支付处理中...',
  /** 等待支付 */
  WAITING: '等待支付',
  /** 请扫码支付 */
  SCAN_TO_PAY: '请使用微信扫描二维码完成支付',
  /** 支付超时 */
  TIMEOUT: '支付超时，请重新下单',
  /** 支付已取消 */
  CANCELLED: '支付已取消',
} as const;

/**
 * 所有消息的集合
 */
export const MESSAGES = {
  SUCCESS: SUCCESS_MESSAGES,
  ERROR: ERROR_MESSAGES,
  WARNING: WARNING_MESSAGES,
  INFO: INFO_MESSAGES,
  VALIDATION: VALIDATION_MESSAGES,
  AUTH: AUTH_MESSAGES,
  ORDER: ORDER_MESSAGES,
  PAYMENT: PAYMENT_MESSAGES,
} as const;

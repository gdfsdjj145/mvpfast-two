/**
 * 应用配置常量
 *
 * 集中管理应用的配置项
 *
 * @example
 * ```ts
 * import { APP_CONFIG, PAGINATION } from '@/constants';
 *
 * console.log(APP_CONFIG.NAME);
 * const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
 * ```
 */

/**
 * 应用基本配置
 */
export const APP_CONFIG = {
  /** 应用名称 */
  NAME: 'MVP Fast',
  /** 应用描述 */
  DESCRIPTION: '快速构建 MVP 的 SaaS 模板',
  /** 默认语言 */
  DEFAULT_LOCALE: 'zh',
  /** 支持的语言列表 */
  SUPPORTED_LOCALES: ['zh', 'en'] as const,
  /** 版本号 */
  VERSION: '1.0.0',
} as const;

/**
 * 分页配置
 */
export const PAGINATION = {
  /** 默认页码 */
  DEFAULT_PAGE: 1,
  /** 默认每页数量 */
  DEFAULT_PAGE_SIZE: 10,
  /** 最大每页数量 */
  MAX_PAGE_SIZE: 100,
  /** 可选的每页数量 */
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
} as const;

/**
 * 缓存配置
 */
export const CACHE_CONFIG = {
  /** 默认缓存时间 (毫秒) */
  DEFAULT_TTL: 5 * 60 * 1000, // 5 分钟
  /** 短期缓存时间 */
  SHORT_TTL: 60 * 1000, // 1 分钟
  /** 长期缓存时间 */
  LONG_TTL: 30 * 60 * 1000, // 30 分钟
  /** 会话缓存时间 */
  SESSION_TTL: 24 * 60 * 60 * 1000, // 24 小时
} as const;

/**
 * 请求超时配置
 */
export const TIMEOUT_CONFIG = {
  /** 默认超时时间 (毫秒) */
  DEFAULT: 30 * 1000, // 30 秒
  /** 文件上传超时 */
  UPLOAD: 5 * 60 * 1000, // 5 分钟
  /** 长轮询超时 */
  LONG_POLLING: 60 * 1000, // 1 分钟
} as const;

/**
 * 验证码配置
 */
export const VERIFICATION_CONFIG = {
  /** 验证码长度 */
  CODE_LENGTH: 6,
  /** 验证码有效期 (秒) */
  CODE_EXPIRY: 5 * 60, // 5 分钟
  /** 发送间隔 (秒) */
  SEND_INTERVAL: 60, // 1 分钟
  /** 每日发送限制 */
  DAILY_LIMIT: 10,
} as const;

/**
 * 文件上传配置
 */
export const UPLOAD_CONFIG = {
  /** 最大文件大小 (字节) */
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  /** 允许的图片类型 */
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,
  /** 允许的图片扩展名 */
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'] as const,
  /** 最大图片宽度 */
  MAX_IMAGE_WIDTH: 4096,
  /** 最大图片高度 */
  MAX_IMAGE_HEIGHT: 4096,
} as const;

/**
 * 密码规则配置
 */
export const PASSWORD_CONFIG = {
  /** 最小长度 */
  MIN_LENGTH: 8,
  /** 最大长度 */
  MAX_LENGTH: 128,
  /** 是否需要大写字母 */
  REQUIRE_UPPERCASE: true,
  /** 是否需要小写字母 */
  REQUIRE_LOWERCASE: true,
  /** 是否需要数字 */
  REQUIRE_NUMBER: true,
  /** 是否需要特殊字符 */
  REQUIRE_SPECIAL: false,
} as const;

/**
 * 订单配置
 */
export const ORDER_CONFIG = {
  /** 订单类型 */
  TYPES: {
    /** 普通订单 */
    NORMAL: 'normal',
    /** 会员订单 */
    MEMBERSHIP: 'membership',
    /** 充值订单 */
    RECHARGE: 'recharge',
  },
  /** 订单状态 */
  STATUS: {
    /** 待支付 */
    PENDING: 'pending',
    /** 已支付 */
    PAID: 'paid',
    /** 已取消 */
    CANCELLED: 'cancelled',
    /** 已退款 */
    REFUNDED: 'refunded',
  },
  /** 支付超时时间 (分钟) */
  PAYMENT_TIMEOUT: 30,
} as const;

/**
 * 支付配置
 */
export const PAYMENT_CONFIG = {
  /** 支付方式 */
  METHODS: {
    /** 微信支付 */
    WECHAT: 'wechat',
    /** 支付宝 */
    ALIPAY: 'alipay',
    /** 云购支付 */
    YUNGOU: 'yungou',
  },
  /** 支付场景 */
  SCENES: {
    /** 扫码支付 */
    NATIVE: 'native',
    /** JSAPI 支付 */
    JSAPI: 'jsapi',
    /** H5 支付 */
    H5: 'h5',
    /** APP 支付 */
    APP: 'app',
  },
  /** 货币类型 */
  CURRENCY: 'CNY',
} as const;

/**
 * 日期格式配置
 */
export const DATE_FORMAT = {
  /** 日期格式 */
  DATE: 'YYYY-MM-DD',
  /** 时间格式 */
  TIME: 'HH:mm:ss',
  /** 日期时间格式 */
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  /** 简短日期时间 */
  DATETIME_SHORT: 'MM-DD HH:mm',
  /** 中文日期 */
  DATE_CN: 'YYYY年MM月DD日',
} as const;

/**
 * 正则表达式
 */
export const REGEX = {
  /** 手机号 (中国大陆) */
  PHONE_CN: /^1[3-9]\d{9}$/,
  /** 邮箱 */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** URL */
  URL: /^https?:\/\/.+/,
  /** 纯数字 */
  NUMBER: /^\d+$/,
  /** 中文字符 */
  CHINESE: /[\u4e00-\u9fa5]/,
  /** 身份证号 */
  ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
} as const;

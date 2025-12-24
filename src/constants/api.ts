/**
 * API 端点常量
 *
 * 集中管理所有 API 端点路径
 *
 * @example
 * ```ts
 * import { API_ENDPOINTS } from '@/constants';
 *
 * fetch(API_ENDPOINTS.ORDERS.LIST);
 * ```
 */

/**
 * API 基础路径
 */
export const API_BASE = '/api';

/**
 * 认证相关 API
 */
export const AUTH_API = {
  /** NextAuth 处理器 */
  NEXTAUTH: `${API_BASE}/auth`,
  /** 登录 */
  SIGNIN: `${API_BASE}/auth/signin`,
  /** 登出 */
  SIGNOUT: `${API_BASE}/auth/signout`,
  /** 获取会话 */
  SESSION: `${API_BASE}/auth/session`,
} as const;

/**
 * 订单相关 API
 */
export const ORDER_API = {
  /** 订单列表/创建 */
  LIST: `${API_BASE}/orders`,
  /** 获取单个订单 */
  DETAIL: (id: string) => `${API_BASE}/orders/${id}`,
} as const;

/**
 * 用户相关 API
 */
export const USER_API = {
  /** 用户列表 */
  LIST: `${API_BASE}/users`,
  /** 用户详情 */
  DETAIL: (id: string) => `${API_BASE}/users/${id}`,
  /** 当前用户信息 */
  ME: `${API_BASE}/users/me`,
} as const;

/**
 * 微信相关 API
 */
export const WECHAT_API = {
  /** 微信回调 */
  CALLBACK: `${API_BASE}/wx/callback`,
  /** 获取微信二维码 */
  CODE: `${API_BASE}/wx/code`,
  /** 创建微信订单 */
  CREATE_ORDER: `${API_BASE}/wx/create-wechat-order`,
  /** 查询微信订单 */
  QUERY_ORDER: `${API_BASE}/wx/query-wechat-order`,
} as const;

/**
 * 云购支付相关 API
 */
export const YUNGOU_API = {
  /** 支付通知回调 */
  NOTIFY: `${API_BASE}/yungou/notify`,
} as const;

/**
 * 搜索相关 API
 */
export const SEARCH_API = {
  /** 搜索 */
  SEARCH: `${API_BASE}/search`,
} as const;

/**
 * 所有 API 端点的集合
 */
export const API_ENDPOINTS = {
  AUTH: AUTH_API,
  ORDER: ORDER_API,
  USER: USER_API,
  WECHAT: WECHAT_API,
  YUNGOU: YUNGOU_API,
  SEARCH: SEARCH_API,
} as const;

/**
 * 外部 API 端点
 */
export const EXTERNAL_API = {
  /** 微信支付 API */
  WECHAT_PAY: {
    /** JSAPI 下单 */
    JSAPI: 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi',
    /** H5 下单 */
    H5: 'https://api.mch.weixin.qq.com/v3/pay/transactions/h5',
    /** 查询订单 */
    QUERY: 'https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no',
  },
  /** 云购 API */
  YUNGOU: {
    /** 微信扫码支付 */
    NATIVE: 'https://api.yungouos.com/api/pay/wxpay/nativePay',
    /** 订单查询 */
    QUERY: 'https://api.yungouos.com/api/pay/wxpay/getWxPayOrderInfo',
  },
} as const;

/**
 * HTTP 方法
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

/**
 * HTTP 状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * 常量统一导出
 *
 * @example
 * ```ts
 * import { ROUTES, API_ENDPOINTS, MESSAGES, APP_CONFIG } from '@/constants';
 *
 * // 使用路由常量
 * <Link href={ROUTES.DASHBOARD.HOME}>控制台</Link>
 *
 * // 使用 API 常量
 * fetch(API_ENDPOINTS.ORDER.LIST);
 *
 * // 使用消息常量
 * toast.success(MESSAGES.SUCCESS.SAVE);
 *
 * // 使用配置常量
 * const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
 * ```
 */

// 路由常量
export {
  ROUTES,
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  PAY_ROUTES,
  PROTECTED_ROUTE_PREFIXES,
  PUBLIC_ROUTE_LIST,
  isProtectedRoute,
  isPublicRoute,
  getLocalizedRoute,
} from './routes';

// API 常量
export {
  API_BASE,
  API_ENDPOINTS,
  AUTH_API,
  ORDER_API,
  USER_API,
  WECHAT_API,
  YUNGOU_API,
  SEARCH_API,
  EXTERNAL_API,
  HTTP_METHODS,
  HTTP_STATUS,
} from './api';

// 配置常量
export {
  APP_CONFIG,
  PAGINATION,
  CACHE_CONFIG,
  TIMEOUT_CONFIG,
  VERIFICATION_CONFIG,
  UPLOAD_CONFIG,
  PASSWORD_CONFIG,
  ORDER_CONFIG,
  PAYMENT_CONFIG,
  DATE_FORMAT,
  REGEX,
} from './config';

// 消息常量
export {
  MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  WARNING_MESSAGES,
  INFO_MESSAGES,
  VALIDATION_MESSAGES,
  AUTH_MESSAGES,
  ORDER_MESSAGES,
  PAYMENT_MESSAGES,
} from './messages';

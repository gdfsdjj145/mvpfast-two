// API 客户端和通用请求方法
export { apiClient, request, createExternalApiClient } from './api';
export type { ApiResponse, ApiError } from './api';

// 认证服务
export { authService } from './auth';
export type { SignInCredentials, SignInResult } from './auth';

// 订单服务
export { orderService } from './order';
export type {
  Order,
  OrderListResponse,
  CreateOrderParams,
  OrderQueryParams,
} from './order';

// 用户服务
export { userService } from './user';
export type {
  User,
  UserUpdateParams,
  UserListResponse,
  UserQueryParams,
} from './user';

// 支付服务
export { paymentService } from './payment';
export type {
  PaymentType,
  WeChatOrderParams,
  WeChatOrderResponse,
  OrderStatusResponse,
  YungouOrderParams,
} from './payment';

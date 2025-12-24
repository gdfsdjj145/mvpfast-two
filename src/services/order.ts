import { request, ApiResponse } from './api';

// 订单类型定义
export interface Order {
  id: string;
  created_time: string;
  identifier: string;
  name: string;
  orderId: string;
  orderType: string;
  price: number;
  promoter?: string | null;
  promotionPrice: number;
  transactionId: string;
}

export interface OrderListResponse {
  items: Order[];
  count: number;
}

export interface CreateOrderParams {
  identifier: string;
  name: string;
  orderId: string;
  orderType: string;
  price: number;
  promotionPrice: number;
  transactionId: string;
  promoter?: string;
}

export interface OrderQueryParams {
  skip?: number;
  take?: number;
  orderType?: string;
}

/**
 * 订单服务
 */
export const orderService = {
  /**
   * 获取订单列表
   */
  getOrders: async (params: OrderQueryParams = {}): Promise<ApiResponse<OrderListResponse>> => {
    const searchParams = new URLSearchParams();

    if (params.skip !== undefined) {
      searchParams.append('skip', String(params.skip));
    }
    if (params.take !== undefined) {
      searchParams.append('take', String(params.take));
    }
    if (params.orderType) {
      searchParams.append('orderType', params.orderType);
    }

    const queryString = searchParams.toString();
    const url = `/api/orders${queryString ? `?${queryString}` : ''}`;

    return request.get<ApiResponse<OrderListResponse>>(url);
  },

  /**
   * 创建订单
   */
  createOrder: async (data: CreateOrderParams): Promise<ApiResponse<Order>> => {
    return request.post<ApiResponse<Order>>('/api/orders', data);
  },

  /**
   * 根据用户标识获取订单
   */
  getOrdersByUser: async (identifier: string, params: Omit<OrderQueryParams, 'orderType'> = {}): Promise<ApiResponse<OrderListResponse>> => {
    return orderService.getOrders({
      ...params,
    });
  },
};

export default orderService;

import { request, ApiResponse, createExternalApiClient } from './api';
import { paySign } from '@/lib/pay/sign';

// 支付类型
export type PaymentType = 'wechat' | 'yungouos';

// 微信支付订单创建参数
export interface WeChatOrderParams {
  amount: number;
  description: string;
  outTradeNo: string;
}

// 微信支付订单响应
export interface WeChatOrderResponse {
  qrCodeUrl: string;
  outTradeNo: string;
  created_time: string;
}

// 订单状态查询响应
export interface OrderStatusResponse {
  trade_state: 'SUCCESS' | 'NOTPAY' | 'CLOSED' | 'PAYERROR';
  transaction_id?: string;
  success_time?: string;
}

// 云购支付参数
export interface YungouOrderParams {
  outTradeNo: string;
  totalFee: string;
  body: string;
}

/**
 * 支付服务
 */
export const paymentService = {
  /**
   * 创建微信支付订单
   */
  createWeChatOrder: async (params: WeChatOrderParams): Promise<ApiResponse<WeChatOrderResponse>> => {
    return request.post<ApiResponse<WeChatOrderResponse>>('/api/wx/create-wechat-order', params);
  },

  /**
   * 查询微信支付订单状态
   */
  queryWeChatOrderStatus: async (outTradeNo: string): Promise<ApiResponse<OrderStatusResponse>> => {
    return request.get<ApiResponse<OrderStatusResponse>>(`/api/wx/query-wechat-order?outTradeNo=${outTradeNo}`);
  },

  /**
   * 创建云购支付订单
   */
  createYungouOrder: async (params: YungouOrderParams): Promise<{ qrCodeUrl: string; outTradeNo: string }> => {
    const mchId = process.env.NEXT_PUBLIC_YUNGOUOS_MCH_ID || '';
    const apiKey = process.env.NEXT_PUBLIC_YUNGOUOS_API_KEY || '';

    const signParams = {
      out_trade_no: params.outTradeNo,
      total_fee: params.totalFee,
      mch_id: mchId,
      body: params.body,
    };

    const sign = paySign(signParams, apiKey);

    const yungouClient = createExternalApiClient('https://api.pay.yungouos.com');

    const response = await yungouClient.post('/api/pay/wxpay/nativePay',
      new URLSearchParams({
        ...signParams,
        auto: '0',
        sign,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      qrCodeUrl: response.data.data,
      outTradeNo: params.outTradeNo,
    };
  },

  /**
   * 生成订单号
   */
  generateOrderNo: (prefix: string = 'order'): string => {
    return `${prefix}${Date.now()}`;
  },

  /**
   * 格式化金额（分转元）
   */
  formatAmount: (amountInCents: number): string => {
    return (amountInCents / 100).toFixed(2);
  },

  /**
   * 解析金额（元转分）
   */
  parseAmount: (amountInYuan: string | number): number => {
    return Math.round(Number(amountInYuan) * 100);
  },
};

export default paymentService;

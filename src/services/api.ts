import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// API 响应的标准格式
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

// API 错误类型
export interface ApiError {
  code: number;
  message: string;
  details?: unknown;
}

// 创建 axios 实例
const createApiClient = (baseURL: string = ''): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000, // 30秒超时
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 可以在这里添加 token
      // const token = getToken();
      // if (token && config.headers) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // 直接返回响应数据
      return response;
    },
    (error) => {
      // 统一错误处理
      const apiError: ApiError = {
        code: error.response?.status || 500,
        message: error.response?.data?.message || error.message || '请求失败',
        details: error.response?.data,
      };

      // 处理特定错误码
      if (error.response?.status === 401) {
        // 未授权，可以触发登出或重定向到登录页
        console.error('Unauthorized, please login again');
      } else if (error.response?.status === 403) {
        console.error('Access denied');
      } else if (error.response?.status === 404) {
        console.error('Resource not found');
      } else if (error.response?.status >= 500) {
        console.error('Server error');
      }

      return Promise.reject(apiError);
    }
  );

  return instance;
};

// 默认 API 客户端（用于内部 API）
export const apiClient = createApiClient();

// 外部 API 客户端（可用于第三方 API）
export const createExternalApiClient = (baseURL: string) => {
  return createApiClient(baseURL);
};

// 通用请求方法
export const request = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;

import { request, ApiResponse } from './api';

// 用户类型定义
export interface User {
  id: string;
  nickName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  wechatOpenId?: string | null;
  created_time: string;
}

export interface UserUpdateParams {
  nickName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface UserListResponse {
  items: User[];
  count: number;
}

export interface UserQueryParams {
  skip?: number;
  take?: number;
}

/**
 * 用户服务
 */
export const userService = {
  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return request.get<ApiResponse<User>>('/api/user/me');
  },

  /**
   * 更新用户信息
   */
  updateUser: async (id: string, data: UserUpdateParams): Promise<ApiResponse<User>> => {
    return request.put<ApiResponse<User>>(`/api/user/${id}`, data);
  },

  /**
   * 更新当前用户信息
   */
  updateCurrentUser: async (data: UserUpdateParams): Promise<ApiResponse<User>> => {
    return request.put<ApiResponse<User>>('/api/user/me', data);
  },

  /**
   * 获取用户列表（管理员）
   */
  getUsers: async (params: UserQueryParams = {}): Promise<ApiResponse<UserListResponse>> => {
    const searchParams = new URLSearchParams();

    if (params.skip !== undefined) {
      searchParams.append('skip', String(params.skip));
    }
    if (params.take !== undefined) {
      searchParams.append('take', String(params.take));
    }

    const queryString = searchParams.toString();
    const url = `/api/users${queryString ? `?${queryString}` : ''}`;

    return request.get<ApiResponse<UserListResponse>>(url);
  },
};

export default userService;

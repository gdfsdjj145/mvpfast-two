import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

// 数据库配置未加载时的硬编码默认值
const DEFAULTS = {
  siteName: 'MvpFast',
  loginType: 'password' as const,
  loginTypes: ['password'] as string[],
};

export interface PublicConfigState {
  siteName: string;
  loginType: string;
  loginTypes: string[];
  googleAnalyticsId: string;
  paymentMethods: any[];
  loaded: boolean;
  loading: boolean;
}

const initialState: PublicConfigState = {
  siteName: DEFAULTS.siteName,
  loginType: DEFAULTS.loginType,
  loginTypes: DEFAULTS.loginTypes,
  googleAnalyticsId: '',
  paymentMethods: [],
  loaded: false,
  loading: false,
};

// 异步获取所有公开配置
export const fetchPublicConfigs = createAsyncThunk(
  'publicConfig/fetchAll',
  async (_, { getState }) => {
    const state = getState() as RootState;
    // 如果已经加载过，不再重复请求
    if (state.publicConfig.loaded) {
      return null;
    }

    const response = await fetch('/api/admin/configs/public?all=true');
    if (!response.ok) {
      throw new Error('Failed to fetch public configs');
    }
    const data = await response.json();
    return data.configs || {};
  }
);

export const publicConfigSlice = createSlice({
  name: 'publicConfig',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicConfigs.pending, (state) => {
        if (!state.loaded) {
          state.loading = true;
        }
      })
      .addCase(fetchPublicConfigs.fulfilled, (state, action) => {
        // null 表示已经加载过，跳过
        if (action.payload === null) return;

        const configs = action.payload;
        state.siteName = configs['system.siteName'] || DEFAULTS.siteName;
        state.loginType = configs['auth.loginType'] || DEFAULTS.loginType;
        state.loginTypes = configs['auth.loginTypes'] || DEFAULTS.loginTypes;
        state.googleAnalyticsId = configs['analytics.googleAnalyticsId'] || '';
        state.paymentMethods = configs['payment.methods'] || [];
        state.loaded = true;
        state.loading = false;
      })
      .addCase(fetchPublicConfigs.rejected, (state) => {
        state.loaded = true;
        state.loading = false;
      });
  },
});

export const selectPublicConfig = (state: RootState) => state.publicConfig;
export const selectSiteName = (state: RootState) => state.publicConfig.siteName;
export const selectLoginConfig = (state: RootState) => ({
  loginType: state.publicConfig.loginType,
  loginTypes: state.publicConfig.loginTypes,
});
export const selectGoogleAnalyticsId = (state: RootState) => state.publicConfig.googleAnalyticsId;
export const selectPublicConfigLoaded = (state: RootState) => state.publicConfig.loaded;
export const selectPaymentMethods = (state: RootState) => state.publicConfig.paymentMethods;

export default publicConfigSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

export interface UserInfo {
  id?: string;
  email?: string | null;
  phone?: string | null;
  nickName?: string | null;
  avatar?: string | null;
}

interface UserState {
  info: UserInfo;
}

const initialState: UserState = {
  info: {},
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setInfo: (state, { payload }: PayloadAction<UserInfo>) => {
      state.info = payload;
    },
    clearInfo: (state) => {
      state.info = {};
    },
  },
});

export const { setInfo, clearInfo } = userSlice.actions;
export const selectUserInfo = (state: RootState) => state.user.info;
export default userSlice.reducer;

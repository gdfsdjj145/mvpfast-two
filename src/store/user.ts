import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  info: {},
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setInfo: (state, { payload }) => {
      state.info = payload;
    },
  },
});

export const { setInfo } = userSlice.actions;
export const selectInfo = (state) => state.user.info;
export default userSlice.reducer;

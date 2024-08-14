"use client";
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import userReducer from './user'

const store = configureStore({
  reducer: {
    user: userReducer
  },
});

export function ReduxProvider ({ children }) {
  return <Provider store={store}>{children}</Provider>;
}

export default store;

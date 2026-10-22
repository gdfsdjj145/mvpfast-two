import { NextResponse } from 'next/server';

// 旧云托管公众号扫码回调已停用。
export const POST = () => NextResponse.json(
  { error: '公众号扫码回调接口已停用' },
  { status: 410 },
);

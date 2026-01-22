import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { redeemCode } from '@/models/redemption';

// POST: 用户兑换积分
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: '请输入兑换码' }, { status: 400 });
    }

    // 获取用户标识（优先使用昵称，其次手机号，再其次邮箱）
    const userIdentifier =
      session.user.nickName ||
      session.user.phone ||
      session.user.email ||
      session.user.id;

    const result = await redeemCode({
      code: code.trim().toUpperCase(),
      userId: session.user.id,
      userIdentifier
    });

    return NextResponse.json({
      success: true,
      data: {
        creditAmount: result.creditAmount,
        newBalance: result.newBalance
      },
      message: `兑换成功！获得 ${result.creditAmount} 积分`
    });
  } catch (error: unknown) {
    console.error('兑换失败:', error);
    const message = error instanceof Error ? error.message : '兑换失败';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

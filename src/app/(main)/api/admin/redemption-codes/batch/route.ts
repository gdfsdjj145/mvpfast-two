import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/models/user';
import { batchCreateRedemptionCodes } from '@/models/redemption';

// POST: 批量生成兑换码
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const adminCheck = await isAdmin(session.user.id);
    if (!adminCheck) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    const body = await request.json();
    const { count, creditAmount, maxUses, expiresAt, description } = body;

    if (!count || count <= 0 || count > 1000) {
      return NextResponse.json({ error: '批量生成数量必须在1-1000之间' }, { status: 400 });
    }

    if (!creditAmount || creditAmount <= 0) {
      return NextResponse.json({ error: '积分数量必须大于0' }, { status: 400 });
    }

    const result = await batchCreateRedemptionCodes({
      count,
      creditAmount,
      maxUses: maxUses || 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      description,
      createdBy: session.user.id
    });

    return NextResponse.json({
      success: true,
      data: {
        codes: result,
        count: result.length,
        batchId: result[0]?.batchId
      }
    });
  } catch (error: unknown) {
    console.error('批量生成兑换码失败:', error);
    const message = error instanceof Error ? error.message : '批量生成兑换码失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/models/user';
import {
  getRedemptionCodeList,
  getRedemptionStats,
  createRedemptionCode
} from '@/models/redemption';

// GET: 获取兑换码列表
export async function GET(request: NextRequest) {
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

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || undefined;
    const isActive = searchParams.get('isActive');
    const batchId = searchParams.get('batchId') || undefined;
    const includeStats = searchParams.get('stats') === 'true';

    const [codeList, stats] = await Promise.all([
      getRedemptionCodeList({
        page,
        pageSize,
        search,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        batchId
      }),
      includeStats ? getRedemptionStats() : null
    ]);

    return NextResponse.json({
      success: true,
      data: codeList,
      stats
    });
  } catch (error: unknown) {
    console.error('获取兑换码列表失败:', error);
    const message = error instanceof Error ? error.message : '获取兑换码列表失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: 创建兑换码
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
    const { creditAmount, maxUses, expiresAt, description, code } = body;

    if (!creditAmount || creditAmount <= 0) {
      return NextResponse.json({ error: '积分数量必须大于0' }, { status: 400 });
    }

    const result = await createRedemptionCode({
      creditAmount,
      maxUses: maxUses || 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      description,
      createdBy: session.user.id,
      code
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: unknown) {
    console.error('创建兑换码失败:', error);
    const message = error instanceof Error ? error.message : '创建兑换码失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

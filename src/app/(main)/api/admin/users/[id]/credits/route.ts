import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/models/user';
import { adjustCredits, getCreditTransactions, getUserCreditInfo, getCreditStats } from '@/models/credit';

// GET: 获取用户积分详情和交易记录
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const adminCheck = await isAdmin(session.user.id);
    if (!adminCheck) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const type = searchParams.get('type') as 'recharge' | 'consume' | 'refund' | undefined;

    const [creditInfo, transactions, stats] = await Promise.all([
      getUserCreditInfo(id),
      getCreditTransactions({
        userId: id,
        skip: (page - 1) * pageSize,
        take: pageSize,
        type
      }),
      getCreditStats(id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        creditInfo,
        transactions: transactions.items,
        total: transactions.count,
        page,
        pageSize,
        totalPages: Math.ceil(transactions.count / pageSize),
        stats,
      },
    });
  } catch (error: any) {
    console.error('获取用户积分详情失败:', error);
    return NextResponse.json(
      { error: error.message || '获取用户积分详情失败' },
      { status: 500 }
    );
  }
}

// POST: 调整用户积分
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const adminCheck = await isAdmin(session.user.id);
    if (!adminCheck) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, reason } = body;

    if (typeof amount !== 'number' || amount === 0) {
      return NextResponse.json(
        { error: '积分调整数量无效' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: '请填写调整原因' },
        { status: 400 }
      );
    }

    const updatedUser = await adjustCredits({
      userId: id,
      amount,
      adminId: session.user.id,
      reason,
    });

    return NextResponse.json({
      success: true,
      data: {
        credits: updatedUser.credits,
        message: amount > 0
          ? `成功增加 ${amount} 积分`
          : `成功扣除 ${Math.abs(amount)} 积分`,
      },
    });
  } catch (error: any) {
    console.error('调整用户积分失败:', error);
    return NextResponse.json(
      { error: error.message || '调整用户积分失败' },
      { status: 500 }
    );
  }
}

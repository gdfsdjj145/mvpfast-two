import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/models/user';
import { getAllCreditTransactions, getCreditSystemStats } from '@/models/credit';

// GET: 获取积分系统统计和交易记录
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const adminCheck = await isAdmin(session.user.id);
    if (!adminCheck) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const userId = searchParams.get('userId') || undefined;
    const type = searchParams.get('type') as 'recharge' | 'consume' | 'refund' | undefined;
    const includeStats = searchParams.get('stats') === 'true';

    const [transactions, stats] = await Promise.all([
      getAllCreditTransactions({ page, pageSize, userId, type }),
      includeStats ? getCreditSystemStats() : null,
    ]);

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions.items,
        total: transactions.total,
        page: transactions.page,
        pageSize: transactions.pageSize,
        totalPages: transactions.totalPages,
      },
      stats,
    });
  } catch (error: any) {
    console.error('获取积分系统数据失败:', error);
    return NextResponse.json(
      { error: error.message || '获取积分系统数据失败' },
      { status: 500 }
    );
  }
}

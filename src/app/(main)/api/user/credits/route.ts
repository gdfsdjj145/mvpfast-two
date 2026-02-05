import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/core/prisma';

// GET: 获取用户积分信息和交易记录
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const type = searchParams.get('type') || undefined;
    const stats = searchParams.get('stats') === 'true';

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: Record<string, unknown> = { userId };
    if (type) {
      where.type = type;
    }

    // 获取记录
    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where,
        orderBy: { created_time: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.creditTransaction.count({ where }),
    ]);

    const response: Record<string, unknown> = {
      success: true,
      data: {
        transactions: transactions.map((tx) => ({
          id: tx.id,
          userId: tx.userId,
          type: tx.type,
          amount: tx.amount,
          balance: tx.balance,
          orderId: tx.orderId,
          description: tx.description,
          metadata: tx.metadata,
          created_time: tx.created_time.toISOString(),
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    // 如果需要统计信息
    if (stats) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true, totalSpent: true },
      });

      // 计算充值和消费总额
      const allTransactions = await prisma.creditTransaction.findMany({
        where: { userId },
        select: { type: true, amount: true },
      });

      let totalRecharge = 0;
      let totalConsume = 0;
      allTransactions.forEach((tx) => {
        if (tx.type === 'recharge' && tx.amount > 0) {
          totalRecharge += tx.amount;
        } else if (tx.type === 'consume' || tx.amount < 0) {
          totalConsume += Math.abs(tx.amount);
        }
      });

      response.stats = {
        currentCredits: user?.credits ?? 0,
        totalSpent: user?.totalSpent ?? 0,
        totalRecharge,
        totalConsume,
        totalTransactions: total,
      };
    }

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('获取用户积分失败:', error);
    const message = error instanceof Error ? error.message : '获取用户积分失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

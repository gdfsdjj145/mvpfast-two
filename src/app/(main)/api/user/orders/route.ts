import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/auth';
import { getOrders } from '@/models/order';

// GET: 获取当前用户的订单列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const orderType = searchParams.get('orderType');

    const skip = (page - 1) * pageSize;

    const where: any = { identifier: session.user.id };
    if (orderType) {
      where.orderType = orderType;
    }

    const { items, count } = await getOrders({
      skip,
      take: pageSize,
      where,
      orderBy: { created_time: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: items,
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    console.error('获取用户订单失败:', error);
    return NextResponse.json(
      { error: '获取订单失败' },
      { status: 500 }
    );
  }
}

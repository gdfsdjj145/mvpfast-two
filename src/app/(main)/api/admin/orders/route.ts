import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getOrderList, getOrderStats, deleteOrder } from '@/models/order';
import { isAdmin } from '@/models/user';

// GET: 获取订单列表
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
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || undefined;
    const orderType = searchParams.get('orderType') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const orderBy = searchParams.get('orderBy') as 'created_time' | 'price' | undefined;
    const order = searchParams.get('order') as 'asc' | 'desc' | undefined;

    // 获取是否需要统计信息
    const includeStats = searchParams.get('stats') === 'true';

    const [orderList, stats] = await Promise.all([
      getOrderList({ page, pageSize, search, orderType, startDate, endDate, orderBy, order }),
      includeStats ? getOrderStats() : null,
    ]);

    return NextResponse.json({
      success: true,
      data: orderList,
      stats,
    });
  } catch (error: any) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json(
      { error: error.message || '获取订单列表失败' },
      { status: 500 }
    );
  }
}

// DELETE: 删除订单
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少订单ID' }, { status: 400 });
    }

    await deleteOrder({ id });

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error: any) {
    console.error('删除订单失败:', error);
    return NextResponse.json(
      { error: error.message || '删除订单失败' },
      { status: 500 }
    );
  }
}

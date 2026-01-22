import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserList, getUserStats, isAdmin } from '@/models/user';

// GET: 获取用户列表
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
    const role = searchParams.get('role') as 'user' | 'admin' | 'superadmin' | undefined;
    const orderBy = searchParams.get('orderBy') as 'created_time' | 'credits' | 'totalSpent' | undefined;
    const order = searchParams.get('order') as 'asc' | 'desc' | undefined;

    // 获取是否需要统计信息
    const includeStats = searchParams.get('stats') === 'true';

    const [userList, stats] = await Promise.all([
      getUserList({ page, pageSize, search, role, orderBy, order }),
      includeStats ? getUserStats() : null,
    ]);

    return NextResponse.json({
      success: true,
      data: userList,
      stats,
    });
  } catch (error: any) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { error: error.message || '获取用户列表失败' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserById, updateUser, updateUserRole, deleteUser, isAdmin, isSuperAdmin } from '@/models/user';
import { getCreditTransactions, getUserCreditInfo } from '@/models/credit';

// GET: 获取单个用户详情
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
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 获取用户积分信息和交易记录
    const [creditInfo, transactions] = await Promise.all([
      getUserCreditInfo(id),
      getCreditTransactions({ userId: id, take: 10 }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        creditInfo,
        recentTransactions: transactions.items,
      },
    });
  } catch (error: any) {
    console.error('获取用户详情失败:', error);
    return NextResponse.json(
      { error: error.message || '获取用户详情失败' },
      { status: 500 }
    );
  }
}

// PUT: 更新用户信息
export async function PUT(
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
    const { role, ...userData } = body;

    // 如果要更新角色
    if (role) {
      // 只有超级管理员可以修改角色
      const superAdminCheck = await isSuperAdmin(session.user.id);
      if (!superAdminCheck) {
        return NextResponse.json(
          { error: '只有超级管理员可以修改用户角色' },
          { status: 403 }
        );
      }

      // 不能修改自己的角色
      if (id === session.user.id) {
        return NextResponse.json(
          { error: '不能修改自己的角色' },
          { status: 400 }
        );
      }

      await updateUserRole(id, role);
    }

    // 更新其他信息
    if (Object.keys(userData).length > 0) {
      await updateUser(id, userData);
    }

    const updatedUser = await getUserById(id);

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('更新用户失败:', error);
    return NextResponse.json(
      { error: error.message || '更新用户失败' },
      { status: 500 }
    );
  }
}

// DELETE: 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 只有超级管理员可以删除用户
    const superAdminCheck = await isSuperAdmin(session.user.id);
    if (!superAdminCheck) {
      return NextResponse.json(
        { error: '只有超级管理员可以删除用户' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // 不能删除自己
    if (id === session.user.id) {
      return NextResponse.json(
        { error: '不能删除自己的账号' },
        { status: 400 }
      );
    }

    await deleteUser(id);

    return NextResponse.json({
      success: true,
      message: '用户已删除',
    });
  } catch (error: any) {
    console.error('删除用户失败:', error);
    return NextResponse.json(
      { error: error.message || '删除用户失败' },
      { status: 500 }
    );
  }
}

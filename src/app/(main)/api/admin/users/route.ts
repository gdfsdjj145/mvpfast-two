import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserList, getUserStats, isAdmin } from '@/models/user';
import prisma from '@/lib/core/prisma';
import bcrypt from 'bcryptjs';
import { getGeneratorName } from '@/lib/utils/name-generator';

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
    const role = searchParams.get('role') as 'user' | 'admin' | undefined;
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

// POST: 创建用户
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
    const { identifier, password, initialCredits } = body;

    // 验证必填字段
    if (!identifier || !password) {
      return NextResponse.json(
        { error: '账号和密码为必填项' },
        { status: 400 }
      );
    }

    // 判断账号类型：纯数字为手机号，其他一律视为邮箱
    const isPhone = /^\d+$/.test(identifier);
    const identifierType = isPhone ? 'phone' : 'email';

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: isPhone ? { phone: identifier } : { email: identifier },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该账号已存在' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户（使用事务处理积分）
    const newUser = await prisma.$transaction(async (tx) => {
      // 1. 创建用户
      const user = await tx.user.create({
        data: {
          [identifierType]: identifier,
          password: hashedPassword,
          nickName: getGeneratorName(),
          wechatOpenId: null,
          phone: identifierType === 'phone' ? identifier : null,
          email: identifierType === 'email' ? identifier : null,
          credits: initialCredits && initialCredits > 0 ? initialCredits : 0,
        },
      });

      // 2. 如果设置了初始积分，记录交易
      if (initialCredits && initialCredits > 0) {
        await tx.creditTransaction.create({
          data: {
            userId: user.id,
            type: 'recharge',
            amount: initialCredits,
            balance: initialCredits,
            description: '管理员创建用户时赠送',
          },
        });
      }

      return user;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        nickName: newUser.nickName,
        email: newUser.email,
        phone: newUser.phone,
      },
      message: '用户创建成功',
    });
  } catch (error: any) {
    console.error('创建用户失败:', error);
    return NextResponse.json(
      { error: error.message || '创建用户失败' },
      { status: 500 }
    );
  }
}

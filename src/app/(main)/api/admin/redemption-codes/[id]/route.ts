import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/models/user';
import {
  getRedemptionCodeById,
  updateRedemptionCode,
  deleteRedemptionCode
} from '@/models/redemption';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 获取兑换码详情
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const result = await getRedemptionCodeById(id);

    if (!result) {
      return NextResponse.json({ error: '兑换码不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: unknown) {
    console.error('获取兑换码详情失败:', error);
    const message = error instanceof Error ? error.message : '获取兑换码详情失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: 更新兑换码
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const body = await request.json();
    const { isActive, description, maxUses, expiresAt } = body;

    const result = await updateRedemptionCode({
      id,
      isActive,
      description,
      maxUses,
      expiresAt: expiresAt ? new Date(expiresAt) : expiresAt === null ? null : undefined
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: unknown) {
    console.error('更新兑换码失败:', error);
    const message = error instanceof Error ? error.message : '更新兑换码失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: 删除兑换码
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    await deleteRedemptionCode(id);

    return NextResponse.json({
      success: true,
      message: '删除成功'
    });
  } catch (error: unknown) {
    console.error('删除兑换码失败:', error);
    const message = error instanceof Error ? error.message : '删除兑换码失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

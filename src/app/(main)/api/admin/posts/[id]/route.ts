import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/models/user';
import { getPostById, updatePost, deletePost } from '@/models/post';

// GET: 获取文章详情
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
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('获取文章详情失败:', error);
    return NextResponse.json(
      { error: error.message || '获取文章详情失败' },
      { status: 500 }
    );
  }
}

// PUT: 更新文章
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
    const { title, slug, description, content, coverImage, category, tags, status } = body;

    const post = await updatePost(id, {
      title,
      slug,
      description,
      content,
      coverImage,
      category,
      tags,
      status,
    });

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('更新文章失败:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug 已存在，请使用其他 Slug' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || '更新文章失败' },
      { status: 500 }
    );
  }
}

// DELETE: 删除文章
export async function DELETE(
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
    await deletePost(id);

    return NextResponse.json({
      success: true,
      message: '文章已删除',
    });
  } catch (error: any) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: error.message || '删除文章失败' },
      { status: 500 }
    );
  }
}

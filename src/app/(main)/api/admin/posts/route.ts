import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/models/user';
import { getPostList, getPostStats, createPost } from '@/models/post';

// GET: 文章列表
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
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const includeStats = searchParams.get('stats') === 'true';

    const [postList, stats] = await Promise.all([
      getPostList({ page, pageSize, search, status, category }),
      includeStats ? getPostStats() : null,
    ]);

    return NextResponse.json({
      success: true,
      data: postList,
      stats,
    });
  } catch (error: any) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json(
      { error: error.message || '获取文章列表失败' },
      { status: 500 }
    );
  }
}

// POST: 创建文章
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const adminCheck = await isAdmin(session.user.id);
    if (!adminCheck) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, description, content, coverImage, category, tags, status } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: '标题、Slug 和内容为必填项' },
        { status: 400 }
      );
    }

    const post = await createPost({
      title,
      slug,
      description,
      content,
      coverImage,
      category,
      tags,
      status,
      authorId: session.user.id,
      authorName: session.user.nickName || session.user.email || '管理员',
    });

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('创建文章失败:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug 已存在，请使用其他 Slug' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || '创建文章失败' },
      { status: 500 }
    );
  }
}

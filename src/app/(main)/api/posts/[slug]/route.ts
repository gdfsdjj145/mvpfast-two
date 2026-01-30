import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug, incrementPostViews } from '@/models/post';

// GET: 按 slug 获取已发布文章，自动 +1 浏览量
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post || post.status !== 'published') {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 异步增加浏览量，不阻塞响应
    incrementPostViews(slug).catch(console.error);

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('获取文章失败:', error);
    return NextResponse.json(
      { error: error.message || '获取文章失败' },
      { status: 500 }
    );
  }
}

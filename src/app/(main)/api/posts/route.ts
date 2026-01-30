import { NextRequest, NextResponse } from 'next/server';
import { getPublishedPosts } from '@/models/post';

// GET: 已发布文章列表（公开）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const category = searchParams.get('category') || undefined;

    const result = await getPublishedPosts({ page, pageSize, category });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json(
      { error: error.message || '获取文章列表失败' },
      { status: 500 }
    );
  }
}

import prisma from '@/lib/core/prisma';
import { Prisma } from '@prisma/client';

// 创建文章
export async function createPost(data: {
  title: string;
  slug: string;
  description?: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  status?: string;
  authorId: string;
  authorName: string;
}) {
  return prisma.post.create({
    data: {
      ...data,
      tags: data.tags || [],
      status: data.status || 'draft',
      publishedAt: data.status === 'published' ? new Date() : null,
    },
  });
}

// 按 ID 获取文章（管理端）
export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
  });
}

// 按 slug 获取文章（前台）
export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
  });
}

// 管理端列表（支持 search/status/category 筛选 + 分页）
export async function getPostList(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  category?: string;
}) {
  const { page = 1, pageSize = 10, search, status, category } = params;
  const skip = (page - 1) * pageSize;

  const where: Prisma.PostWhereInput = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (category) {
    where.category = category;
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { created_time: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        category: true,
        tags: true,
        status: true,
        authorId: true,
        authorName: true,
        publishedAt: true,
        views: true,
        created_time: true,
        updated_time: true,
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// 前台列表（仅 published）
export async function getPublishedPosts(params: {
  page?: number;
  pageSize?: number;
  category?: string;
}) {
  const { page = 1, pageSize = 12, category } = params;
  const skip = (page - 1) * pageSize;

  const where: Prisma.PostWhereInput = {
    status: 'published',
  };

  if (category) {
    where.category = category;
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        category: true,
        tags: true,
        authorName: true,
        publishedAt: true,
        views: true,
        created_time: true,
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// 更新文章
export async function updatePost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    content?: string;
    coverImage?: string;
    category?: string;
    tags?: string[];
    status?: string;
  }
) {
  const updateData: Prisma.PostUpdateInput = { ...data };

  // 发布时自动设置 publishedAt
  if (data.status === 'published') {
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { publishedAt: true },
    });
    if (!existing?.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  return prisma.post.update({
    where: { id },
    data: updateData,
  });
}

// 删除文章
export async function deletePost(id: string) {
  return prisma.post.delete({
    where: { id },
  });
}

// 浏览量 +1
export async function incrementPostViews(slug: string) {
  return prisma.post.update({
    where: { slug },
    data: { views: { increment: 1 } },
  });
}

// 统计（总数/已发布/草稿/总浏览量）
export async function getPostStats() {
  const [total, published, draft, viewsAgg] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'published' } }),
    prisma.post.count({ where: { status: 'draft' } }),
    prisma.post.aggregate({ _sum: { views: true } }),
  ]);

  return {
    total,
    published,
    draft,
    totalViews: viewsAgg._sum.views || 0,
  };
}

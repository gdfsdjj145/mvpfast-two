import React from 'react';
import Link from 'next/link';
import { compareDesc, format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale'; // 导入中文本地化
import { allBlogPosts } from 'contentlayer/generated';
import Image from 'next/image';

function PostCard(post: any) {
  const coverImagePath = post.coverImage
    ? `/blog/assets/${post.coverImage}`
    : '/default-blog-cover.jpg'; // 默认封面图片

  return (
    <Link
      href={post.url}
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative w-full h-48">
        <Image
          src={coverImagePath}
          alt={post.title}
          fill
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute top-2 left-2">
          <span className="bg-yellow-400 text-sm font-semibold px-2 py-1 rounded">
            {post.category || '未分类'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2 line-clamp-2">
          <div className="text-gray-800 hover:text-blue-600">{post.title}</div>
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{post.description}</p>
        <div className="flex items-center justify-between">
          <time dateTime={post.date} className="text-sm text-gray-500">
            {format(parseISO(post.date), 'yyyy年MM月dd日', { locale: zhCN })}
          </time>
        </div>
      </div>
    </Link>
  );
}

export default function page() {
  const posts = allBlogPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <div className="pb-60">
      <h1 className="text-3xl font-bold text-center mb-8">博客文章</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, idx) => (
          <PostCard key={idx} {...post} />
        ))}
      </div>
    </div>
  );
}

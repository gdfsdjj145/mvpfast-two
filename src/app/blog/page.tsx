import Link from 'next/link';
import { compareDesc, format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale'; // 导入中文本地化
import { allBlogPosts } from 'contentlayer/generated';
import Image from 'next/image';
import Header from '@/components/Header';

function PostCard(post: any) {
  const coverImagePath = post.coverImage
    ? `/blog/assets/${post.coverImage}`
    : null;

  return (
    <a
      href={post.url}
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
    >
      {coverImagePath && (
        <div className="relative w-full h-48">
          <Image
            src={coverImagePath}
            alt={post.title}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">
          <Link href={post.url} className="text-blue-600 hover:text-blue-800">
            {post.title}
          </Link>
        </h2>
        <time dateTime={post.date} className="text-sm text-gray-500 mb-2 block">
          {format(parseISO(post.date), 'yyyy年MM月dd日', { locale: zhCN })}
        </time>
        {post.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">{post.description}</p>
        )}
      </div>
    </a>
  );
}

export default function BlogPage() {
  const posts = allBlogPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">博客文章</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          {posts.map((post, idx) => (
            <PostCard key={idx} {...post} />
          ))}
        </div>
      </main>
    </>
  );
}

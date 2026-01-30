import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, incrementPostViews } from '@/models/post';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; local: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== 'published') {
    return { title: '文章不存在' };
  }

  return {
    title: post.title,
    description: post.description || post.title,
    openGraph: {
      title: post.title,
      description: post.description || post.title,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; local: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  // 异步增加浏览量
  incrementPostViews(slug).catch(() => {});

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* 返回链接 */}
        <div className="mb-8">
          <Link
            href="../blog"
            className="text-primary hover:underline text-sm"
          >
            &larr; 返回博客列表
          </Link>
        </div>

        {/* 封面图 */}
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 object-cover rounded-xl mb-8"
          />
        )}

        {/* 标题和元信息 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/60 mb-8">
          <span>{post.authorName}</span>
          <span>·</span>
          <span>
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : ''}
          </span>
          <span>·</span>
          <span>{post.views} 次浏览</span>
          {post.category && (
            <>
              <span>·</span>
              <span className="badge badge-outline badge-sm">{post.category}</span>
            </>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="badge badge-ghost badge-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 文章内容 */}
        <article className="prose prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

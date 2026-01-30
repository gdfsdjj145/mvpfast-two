import Link from 'next/link';
import { getPublishedPosts } from '@/models/post';

export const metadata = {
  title: '博客',
  description: '浏览最新的博客文章',
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const category = params.category || undefined;

  const { posts, totalPages } = await getPublishedPosts({
    page,
    pageSize: 12,
    category,
  });

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">博客</h1>
          <p className="text-base-content/60 text-lg">最新文章和技术分享</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-base-content/60">
            <p className="text-lg">暂无文章</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`blog/${post.slug}`}
                className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow border border-base-300"
              >
                {post.coverImage && (
                  <figure>
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </figure>
                )}
                <div className="card-body">
                  <h2 className="card-title text-lg">{post.title}</h2>
                  {post.description && (
                    <p className="text-base-content/60 text-sm line-clamp-2">
                      {post.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2 text-xs text-base-content/50">
                    <span>{post.authorName}</span>
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('zh-CN')
                        : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {post.category && (
                      <span className="badge badge-outline badge-xs">
                        {post.category}
                      </span>
                    )}
                    {post.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="badge badge-ghost badge-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <div className="join">
              {page > 1 && (
                <Link
                  href={`?page=${page - 1}${category ? `&category=${category}` : ''}`}
                  className="join-item btn btn-sm"
                >
                  上一页
                </Link>
              )}
              <button className="join-item btn btn-sm btn-active">
                第 {page} 页
              </button>
              {page < totalPages && (
                <Link
                  href={`?page=${page + 1}${category ? `&category=${category}` : ''}`}
                  className="join-item btn btn-sm"
                >
                  下一页
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

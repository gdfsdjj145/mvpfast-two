import { blogSource } from '@/../source';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/common';
import { type PageData } from 'fumadocs-core/source';
import { getPublishedPosts } from '@/models/post';

interface BlogPageData extends PageData {
  date?: Date;
  category?: string;
  tags?: string[] | string;
}

interface BlogPost {
  slug: string[];
  url: string;
  title: string;
  description: string;
  date: string;
  rawDate: Date;
  category: string;
  coverImage: string;
  tags: string[];
}

const COVER_IMAGE_MAP: Record<string, string> = {
  '商用协议': '1.png',
  '支付和备案问题': '2.png',
};

function getCoverImage(title?: string): string {
  if (!title) return '/blog/assets/1.png';
  const imageName = COVER_IMAGE_MAP[title];
  return imageName ? `/blog/assets/${imageName}` : '/blog/assets/1.png';
}

function getMdxBlogs(): BlogPost[] {
  const pages = blogSource.getPages();
  return pages.map((page) => {
    const data = page.data as BlogPageData;
    const rawDate = data.date ? new Date(data.date) : new Date();
    return {
      slug: page.slugs,
      url: page.url,
      title: data.title || '无标题',
      description: data.description || '',
      date: formatDate(rawDate),
      rawDate,
      category: data.category || '未分类',
      coverImage: getCoverImage(data.title),
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
    };
  });
}

export default async function BlogPage() {
  const mdxBlogs = getMdxBlogs();

  const { posts: dbPosts } = await getPublishedPosts({ pageSize: 100 });
  const dbBlogs: BlogPost[] = dbPosts.map((post) => {
    const rawDate = post.publishedAt ? new Date(post.publishedAt) : new Date(post.created_time);
    return {
      slug: ['post', post.slug],
      url: `/blog/post/${post.slug}`,
      title: post.title,
      description: post.description || '',
      date: formatDate(rawDate),
      rawDate,
      category: post.category || '未分类',
      coverImage: post.coverImage || '/blog/assets/1.png',
      tags: post.tags || [],
    };
  });

  const blogs = [...mdxBlogs, ...dbBlogs].sort(
    (a, b) => b.rawDate.getTime() - a.rawDate.getTime()
  );

  const badgeColors = [
    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  ];

  return (
    <div className="max-w-[1100px] mx-auto pt-10 pb-20 px-6">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-3">文章</h1>
        <p className="text-base text-fd-muted-foreground">
          探索最新技术趋势、开发心得与行业洞察 | 最新文章和更新
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {blogs.map((blog, index) => (
          <Link
            key={blog.slug.join('/')}
            href={blog.url}
            className="group flex flex-col rounded-xl bg-fd-card shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_12px_-3px_rgba(0,0,0,0.1),0_3px_5px_-2px_rgba(0,0,0,0.05)]"
          >
            <div className="relative h-[180px] overflow-hidden bg-fd-muted">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                width={600}
                height={360}
                loading="eager"
                priority={index < 6}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col flex-1 p-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold tracking-wide ${badgeColors[index % badgeColors.length]}`}
                >
                  {blog.category}
                </span>
                <span className="text-xs text-fd-muted-foreground">
                  {blog.date}
                </span>
              </div>
              <h2 className="text-base font-bold leading-snug mb-2 group-hover:text-fd-primary transition-colors line-clamp-1">
                {blog.title}
              </h2>
              <p className="text-[13px] text-fd-muted-foreground leading-relaxed mb-3 line-clamp-2 flex-1">
                {blog.description}
              </p>
              <div className="flex items-center mt-auto">
                <span className="text-fd-primary font-semibold text-xs flex items-center gap-1 group-hover:gap-1.5 transition-all">
                  Read Article
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

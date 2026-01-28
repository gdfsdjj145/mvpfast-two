import { blogSource } from '@/../source';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { type Page, type PageData } from 'fumadocs-core/source';

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

function getBlogs(): BlogPost[] {
  const pages = blogSource.getPages();
  return pages
    .map((page) => {
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
    })
    .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
}

export default function BlogPage() {
  const blogs = getBlogs();

  return (
    <div className="container max-w-[1200px] mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">博客</h1>
        <p className="text-lg text-fd-muted-foreground">最新文章和更新</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog, index) => (
          <Link
            key={blog.slug.join('/')}
            href={blog.url}
            className="group flex flex-col rounded-2xl border border-fd-border bg-fd-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-fd-primary/20 p-4"
          >
            <div className="relative h-[200px] overflow-hidden bg-fd-muted rounded-xl">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                width={400}
                height={225}
                loading="eager"
                priority={index < 4}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col flex-1 pt-4">
              <h2 className="text-lg font-semibold mb-2 group-hover:text-fd-primary transition-colors line-clamp-1">
                {blog.title}
              </h2>
              <p className="text-sm text-fd-muted-foreground mb-4 line-clamp-2 flex-1 leading-relaxed">
                {blog.description}
              </p>
              <div className="flex items-center justify-between text-xs text-fd-muted-foreground pt-3 border-t border-fd-border">
                <span>{blog.date}</span>
                <span className="px-2 py-0.5 bg-fd-accent/50 rounded-md">{blog.category}</span>
              </div>
              {blog.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-fd-accent text-fd-accent-foreground text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

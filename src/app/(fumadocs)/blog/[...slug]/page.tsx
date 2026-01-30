import { blogSource } from '@/../source';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '../mdx-components';
import Link from 'next/link';
import { getPostBySlug, incrementPostViews } from '@/models/post';
import ReactMarkdown from 'react-markdown';
import { formatDate } from '@/lib/utils';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const slug = params.slug;

  // Database post: /blog/post/[slug]
  if (slug && slug[0] === 'post' && slug[1]) {
    const postSlug = decodeURIComponent(slug[1]);
    const post = await getPostBySlug(postSlug);
    if (!post || post.status !== 'published') notFound();

    await incrementPostViews(postSlug);

    const publishedDate = post.publishedAt
      ? formatDate(new Date(post.publishedAt))
      : formatDate(new Date(post.created_time));

    return (
      <article className="container max-w-[800px] mx-auto py-12 px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-fd-muted-foreground hover:text-fd-foreground mb-8 transition-colors"
        >
          &larr; 返回文章列表
        </Link>
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
        {post.description && (
          <p className="text-lg text-fd-muted-foreground mb-4">
            {post.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-fd-muted-foreground mb-8">
          {post.authorName && <span>{post.authorName}</span>}
          <span>{publishedDate}</span>
          <span>{post.views} 次阅读</span>
        </div>
        <div className="prose min-w-0">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    );
  }

  // MDX post: /blog/[slug]
  const page = blogSource.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <article className="container max-w-[800px] mx-auto py-12 px-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-fd-muted-foreground hover:text-fd-foreground mb-8 transition-colors"
      >
        &larr; 返回文章列表
      </Link>
      <h1 className="text-3xl font-bold mb-3">{page.data.title}</h1>
      {page.data.description && (
        <p className="text-lg text-fd-muted-foreground mb-8">
          {page.data.description}
        </p>
      )}
      <div className="prose min-w-0">
        <MDX components={getMDXComponents()} />
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  return blogSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const slug = params.slug;

  // Database post metadata
  if (slug && slug[0] === 'post' && slug[1]) {
    const postSlug = decodeURIComponent(slug[1]);
    const post = await getPostBySlug(postSlug);
    if (!post) return {};

    return {
      title: post.title,
      description: post.description || '',
    };
  }

  // MDX post metadata
  const page = blogSource.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

import { blogSource } from '@/../source';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '../mdx-components';
import Link from 'next/link';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = blogSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <article className="container max-w-[800px] mx-auto py-12 px-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-fd-muted-foreground hover:text-fd-foreground mb-8 transition-colors"
      >
        &larr; 返回博客列表
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
  const page = blogSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

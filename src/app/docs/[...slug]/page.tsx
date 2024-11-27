import { allDocPages } from 'contentlayer/generated';
import DocPageClient from './DocPageClient';
import { notFound } from 'next/navigation';
import { cache } from 'react';

// 缓存文档查找函数
const getDoc = cache((slug: string) => {
  return allDocPages.find((doc) => doc.url === `/docs/${slug}`);
});

export const generateStaticParams = async () => {
  return allDocPages.map((doc) => ({
    slug: doc.url.replace('/docs/', '').split('/'),
  }));
};

// 禁用所有动态行为和 Suspense
export const dynamic = 'force-static';
export const revalidate = false;
export const fetchCache = 'force-cache';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';
export const suspense = false;

const DocPage = ({ params }: { params: { slug: string[] } }) => {
  const slug = params.slug.join('/');
  const doc = getDoc(slug);

  if (!doc) {
    notFound();
  }

  return <DocPageClient doc={doc} />;
};

export default DocPage;

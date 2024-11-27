import { allDocPages } from 'contentlayer/generated';
import DocPageClient from './DocPageClient';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// 缓存文档查找函数
const getDoc = (slug: string) => {
  return allDocPages.find((doc) => doc.url === `/docs/${slug}`);
};

export const generateStaticParams = async () => {
  return allDocPages.map((doc) => ({
    slug: doc.url.replace('/docs/', '').split('/'),
  }));
};

// 只保留有效的静态生成配置
export const dynamic = 'force-static';
export const revalidate = false;
export const fetchCache = 'force-cache';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

const DocPage = ({ params }: { params: { slug: string[] } }) => {
  const slug = params.slug.join('/');
  const doc = getDoc(slug);

  if (!doc) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <DocPageClient doc={doc} />
    </Suspense>
  );
};

export default DocPage;

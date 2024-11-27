import { allDocPages } from 'contentlayer/generated';
import DocPageClient from './DocPageClient';
import { notFound } from 'next/navigation';

export const generateStaticParams = async () => {
  return allDocPages.map((doc) => ({
    slug: doc.url.replace('/docs/', '').split('/'),
  }));
};

const DocPage = ({ params }: { params: { slug: string[] } }) => {
  const slug = params.slug.join('/');
  const doc = allDocPages.find((doc) => doc.url === `/docs/${slug}`);

  if (!doc) {
    notFound();
  }

  return <DocPageClient doc={doc} />;
};

export default DocPage;

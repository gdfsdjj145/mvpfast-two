import { allDocPages } from 'contentlayer/generated';
import DocLayout from '@/components/DocumentLayout';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import 'github-markdown-css/github-markdown.css';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const generateStaticParams = async () => {
  return allDocPages.map((doc) => ({
    slug: doc.url.replace('/docs/', '').split('/'),
  }));
};

const DocPageComponent = ({ params }: { params: { slug: string[] } }) => {
  const slug = params.slug.join('/');
  const doc = allDocPages.find((doc) => doc.url === `/docs/${slug}`);

  if (!doc) {
    notFound();
  }

  const components = {
    img: ({ src, alt }: { src: string; alt?: string }) => (
      <span className="flex justify-center my-4">
        <Image
          src={src}
          alt={alt || ''}
          width={1200}
          height={500}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </span>
    ),
    p: ({ children }: { children: React.ReactNode }) => {
      if (typeof children === 'string' || typeof children === 'number') {
        return <p>{children}</p>;
      }
      return <>{children}</>;
    },
  };

  return (
    <DocLayout>
      <article className="markdown-body prose prose-lg lg:prose-xl dark:prose-invert max-w-none w-full px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{doc.title}</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {doc.body.raw}
          </ReactMarkdown>
        </div>
      </article>
    </DocLayout>
  );
};

export default DocPageComponent;

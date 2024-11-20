import { allDocPages } from 'contentlayer/generated';
import DocLayout from '@/components/DocumentLayout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/mdx.css';

export const generateStaticParams = async () => {
  return allDocPages.map((doc) => ({
    slug: doc.url.replace('/docs/', '').split('/'),
  }));
};

const components = {
  img: ({ src, alt }: { src: string; alt?: string }) => (
    <div className="my-6">
      <Image
        src={src}
        alt={alt || ''}
        width={1200}
        height={500}
        className="rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => {
    if (href?.startsWith('http')) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
        >
          {children}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      );
    }
    return (
      <Link
        href={href || ''}
        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {children}
      </Link>
    );
  },
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      {children}
    </pre>
  ),
  // 添加表格相关组件
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto my-8">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
  ),
  tbody: ({ children }: { children: React.ReactNode }) => (
    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </tbody>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
      {children}
    </td>
  ),
  // 添加其他基础组件
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-900 dark:text-gray-100">
      {children}
    </h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-base leading-7 mb-4 text-gray-600 dark:text-gray-300">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600 dark:text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-600 dark:text-gray-300">
      {children}
    </ol>
  ),
};

const DocPageComponent = ({ params }: { params: { slug: string[] } }) => {
  const slug = params.slug.join('/');
  const doc = allDocPages.find((doc) => doc.url === `/docs/${slug}`);

  if (!doc) {
    notFound();
  }

  return (
    <DocLayout>
      <div className="max-w-4xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          {doc.title}
        </h1>

        <article className="prose prose-base lg:prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={components}
          >
            {doc.body.raw}
          </ReactMarkdown>
        </article>

        <nav className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex justify-between">{/* 导航内容 */}</div>
        </nav>
      </div>
    </DocLayout>
  );
};

export default DocPageComponent;

import { allDocPages } from 'contentlayer/generated';
import DocLayout from '@/components/DocumentLayout';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // 代码高亮主题
// import { FaCalendar, FaClock } from 'react-icons/fa'; // 引入图标

const DocPageComponent = ({ params }: { params: { slug: string } }) => {
  const doc = allDocPages.find(
    (doc) => doc._raw.flattenedPath === `docs/${params.slug}`
  );
  if (!doc) throw new Error(`文档未找到，slug: ${params.slug}`);

  return (
    <DocLayout>
      <article className="prose prose-lg lg:prose-xl dark:prose-invert max-w-none w-full px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{doc.title}</h1>
          <div className="flex justify-center items-center text-sm text-gray-600 dark:text-gray-400">
            {/* <FaCalendar className="mr-2" /> */}
            {/* <span className="mr-4">{new Date(doc.date).toLocaleDateString()}</span> */}
            {/* <FaClock className="mr-2" /> */}
            {/* <span>{doc.readingTime} 分钟阅读</span> */}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            className="markdown-body"
          >
            {doc.body.raw}
          </ReactMarkdown>
        </div>
      </article>
    </DocLayout>
  );
};

export default DocPageComponent;
import { format, parseISO } from 'date-fns';
import { allBlogPosts } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export const generateStaticParams = async () => {
  return allBlogPosts.map((post) => ({ slug: post._raw.flattenedPath }));
};

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allBlogPosts.find(
    (post) => post._raw.flattenedPath === `blog/${params.slug}`
  );
  if (!post) notFound();
  return { title: post.title };
};

const getReadingTime = (content: string) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/g).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

export default function PostPage({ params }: { params: { slug: string } }) {
  const post: any = allBlogPosts.find(
    (post) => post._raw.flattenedPath === `blog/${params.slug}`
  );
  if (!post) notFound();

  const readingTime = getReadingTime(post.body.raw);

  return (
    <article className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <div className="text-gray-600 text-sm mb-4">
          <time dateTime={post.date}>
            {format(parseISO(post.date), 'LLLL d, yyyy')}
          </time>
          <span className="mx-2">·</span>
          <span>{readingTime} min read</span>
        </div>
        {post.description && (
          <p className="text-xl text-gray-600 mb-8">{post.description}</p>
        )}
      </div>
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown>{post.body.raw}</ReactMarkdown>
      </div>
    </article>
  );
}

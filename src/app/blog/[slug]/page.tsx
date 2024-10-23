import { allBlogPosts } from 'contentlayer/generated';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

export const generateStaticParams = async () => {
  return allBlogPosts.map((post) => ({
    slug: post.url.replace('/blog/', ''),
  }));
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = allBlogPosts.find((post) => post.url === `/blog/${params.slug}`);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/blog"
        className="inline-block mb-6 text-blue-600 hover:text-blue-800"
      >
        <span className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          返回博客列表
        </span>
      </Link>

      <article className="prose lg:prose-xl">
        <h1 className="mb-4">{post.title}</h1>
        <time dateTime={post.date} className="text-sm text-gray-600 mb-4 block">
          {format(parseISO(post.date), 'LLLL d, yyyy')}
        </time>
        <div dangerouslySetInnerHTML={{ __html: post.body.html }} />
      </article>
    </div>
  );
}

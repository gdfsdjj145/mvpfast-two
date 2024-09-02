import { format, parseISO } from 'date-fns';
import { allBlogPosts } from 'contentlayer/generated';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export const generateStaticParams = async () =>
  allBlogPosts.map((post) => ({ slug: post._raw.flattenedPath }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allBlogPosts.find(
    (post) => post._raw.flattenedPath === params.slug
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
  const post = allBlogPosts.find(
    (post) => post._raw.flattenedPath === params.slug
  );
  if (!post) notFound();

  const Content = MDXRemote(post.body.code);
  const { data: session } = useSession();

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
        {session && session.user && (
          <div className="flex items-center mb-4">
            <Image
              src={session.user.image || '/default-avatar.png'}
              alt={session.user.name || 'Author'}
              width={40}
              height={40}
              className="rounded-full mr-2"
            />
            <span className="text-sm text-gray-700">{session.user.name}</span>
          </div>
        )}
        {post.description && (
          <p className="text-xl text-gray-600 mb-8">{post.description}</p>
        )}
      </div>
      <div className="prose prose-lg max-w-none">
        <Content />
      </div>
    </article>
  );
}

import Link from 'next/link';
import { compareDesc, format, parseISO } from 'date-fns';
import { allBlogPosts } from 'contentlayer/generated';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

function PostCard(post: any) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
      {post.coverImage && (
        <Image
          src={post.coverImage}
          alt={post.title}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">
          <Link href={post.url} className="text-blue-600 hover:text-blue-800">
            {post.title}
          </Link>
        </h2>
        <time dateTime={post.date} className="text-sm text-gray-500 mb-2 block">
          {format(parseISO(post.date), 'LLLL d, yyyy')}
        </time>
        {post.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">{post.description}</p>
        )}
      </div>
    </div>
  );
}

export default function BlogPage() {
  const posts = allBlogPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">博客文章</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
        {posts.map((post, idx) => (
          <PostCard key={idx} {...post} />
        ))}
      </div>
    </div>
  );
}

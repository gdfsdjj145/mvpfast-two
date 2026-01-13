"use client";

import { useEffect, useState } from 'react';
import { blogSource } from '@/../source';
import { getMDXComponents } from './mdx-components';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { type Page, type PageData } from 'fumadocs-core/source';

// 创建自定义类型扩展PageData
interface BlogPageData extends PageData {
  date?: string;
  author?: string;
  authorName?: string;
  category?: string;
  coverImage?: string;
  tags?: string[] | string;
  body: React.ComponentType<{ components?: any }>;
  toc: any;
  full?: boolean;
}

// 处理博客数据的接口
interface BlogPost {
  slug: string[];
  title: string;
  description: string;
  date: string;
  rawDate: Date;
  authorName: string;
  category: string;
  coverImage: string;
  tags: string[];
  body: React.ComponentType<{ components?: any }>;
  toc: any;
  full?: boolean;
}

// 处理博客数据的函数
function processBlogData(blogPages: Array<Page<PageData>>): BlogPost[] {
  return blogPages.map((page) => {
    const data = page.data as BlogPageData;
    const rawDate = data.date ? new Date(data.date) : new Date();

    const hash: Record<string, string> = {
      '商用协议': '1.png',
      '支付和备案问题': '2.png',
    }

    // 获取图片路径，如果标题不在hash中则使用默认图片
    const getImagePath = (title: string | undefined) => {
      if (!title) return '/blog/assets/1.png';
      const imageName = hash[title];
      if (!imageName) {
        return '/blog/assets/1.png'; // 添加前导斜杠表示从根目录开始
      }
      return `/blog/assets/${imageName}`;  // 添加前导斜杠表示从根目录开始
    };
    
    return {
      slug: page.slugs,
      title: data.title || '无标题',
      description: data.description || '',
      date: formatDate(rawDate),
      rawDate,
      authorName: 'MvpFast',
      category: data.category || '未分类',
      coverImage: getImagePath(data.title),
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      body: data.body,
      toc: data.toc,
      full: data.full
    };
  }).sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
}

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取所有博客数据
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const pages = blogSource.getPages();
        const processedBlogs = processBlogData(pages);
        setBlogs(processedBlogs);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // 返回博客列表视图
  const backToList = () => {
    setSelectedBlog(null);
  };

  if (loading) {
    return (
      <div className="blog-container flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
          <p className="mt-4 text-lg">正在加载博客内容...</p>
        </div>
      </div>
    );
  }

  // 如果选择了博客文章，显示文章内容
  if (selectedBlog) {
    const MDX = selectedBlog.body;
    return (
      <div className="blog-container">
        <button 
          onClick={backToList} 
          className="back-button px-4 py-2 text-blue-600 hover:text-blue-800"
        >
          返回博客列表
        </button>
        
        <div className="blog-article">
          <h1 className="text-3xl font-bold mb-2">{selectedBlog.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{selectedBlog.description}</p>
          <div className="mb-6 text-gray-600">
            {selectedBlog.date} · {selectedBlog.authorName} · {selectedBlog.category}
          </div>
          
          <div className="mb-6">
            <Image 
              src={selectedBlog.coverImage} 
              alt={selectedBlog.title}
              width={800}
              height={400}
              loading="eager"
              priority
              className="rounded-lg w-full h-auto object-cover"
              onError={(e) => {
                console.error(`图片加载失败: ${selectedBlog.coverImage}`);
                e.currentTarget.style.border = '1px solid red';
              }}
              onLoad={() => console.log(`图片加载成功: ${selectedBlog.coverImage}`)}
            />
          </div>
          
          <div className="prose prose-blue max-w-none">
            <MDX components={getMDXComponents()} />
          </div>
        </div>
      </div>
    );
  }

  // 显示博客文章列表
  return (
    <div className="blog-container">
      <style jsx global>{`
        .blog-card-image {
          background-color: #f5f5f5;
          min-height: 225px;
          position: relative;
        }
      `}</style>

      <div className="blog-header">
        <h1 className="text-4xl font-bold mb-2">博客</h1>
        <p className="text-xl text-gray-600 mb-8">最新文章和更新</p>
      </div>

      <div className="blog-grid">
        {blogs.map((blog, index) => (
          <div 
            key={blog.slug.join('/')}
            className="blog-card" 
            onClick={() => setSelectedBlog(blog)}
          >
            <div className="blog-card-image">
              <Image 
                src={blog.coverImage} 
                alt={blog.title}
                width={400}
                height={225}
                loading="eager"
                priority={index < 4} // 优先加载前4张图片
                className="rounded-t-lg w-full h-auto object-cover"
                onError={(e) => {
                  console.error(`图片加载失败: ${blog.coverImage}`);
                  e.currentTarget.style.border = '1px solid red';
                }}
                onLoad={() => console.log(`图片加载成功: ${blog.coverImage}`)}
              />
            </div>
            <div className="blog-card-content">
              <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
              <p className="text-gray-600 mb-2">{blog.description}</p>
              <div className="text-sm text-gray-500">
                {blog.date} · {blog.authorName}
              </div>
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


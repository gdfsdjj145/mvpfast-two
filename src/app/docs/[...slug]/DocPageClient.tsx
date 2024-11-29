'use client';
import React from 'react';
import DocLayout from '@/components/DocumentLayout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/mdx.css';
import { Highlight, themes } from 'prism-react-renderer';

// 复制按钮组件
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="absolute right-2 top-2 rounded-md bg-white/10 px-2 py-1 text-sm text-white/80 hover:bg-white/20 z-10"
    >
      {copied ? (
        <span className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          已复制
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          复制
        </span>
      )}
    </button>
  );
};

// 语言映射配置
const languageMap: { [key: string]: string } = {
  js: 'javascript',
  javascript: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  typescript: 'typescript',
  bash: 'bash',
  shell: 'shell',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  css: 'css',
  html: 'html',
  json: 'json',
  yaml: 'yaml',
  sql: 'sql',
  graphql: 'graphql',
  rust: 'rust',
  go: 'go',
  php: 'php',
};

// Markdown 组件配置
const components = {
  img: ({ src, alt }: { src?: string; alt?: string }) => {
    // 使用 useMemo 来确保组件在服务端和客户端渲染结果一致
    return React.useMemo(
      () => (
        <div className="relative my-8 flex justify-center">
          {src && (
            <div className="relative w-full max-w-3xl">
              <Image
                src={src}
                alt={alt || ''}
                width={0}
                height={0}
                sizes="100vw"
                className="rounded-lg w-full h-auto"
                priority={true}
                quality={100}
                style={{
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
        </div>
      ),
      [src, alt]
    );
  },
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <Link
      href={href || ''}
      className="text-secondary hover:text-secondary transition-colors duration-200 font-weight-600"
    >
      {children}
    </Link>
  ),
  pre: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    const childArray = React.Children.toArray(children);
    const codeElement = childArray[0] as React.ReactElement;
    const codeString = codeElement?.props?.children || '';
    const rawLanguage =
      codeElement?.props?.className?.replace('language-', '') || '';
    const language = languageMap[rawLanguage] || rawLanguage || 'plain';

    return (
      <div className="relative my-6">
        <div className="bg-[#1e1e1e] px-4 py-2.5 text-xs text-gray-200 flex justify-between items-center border-b border-gray-800 rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
            <span className="ml-3 font-mono text-gray-400">{language}</span>
          </div>
        </div>
        <div className="relative bg-[#1e1e1e] rounded-b-lg">
          <div className="overflow-x-auto p-4">
            <CopyButton
              text={typeof codeString === 'string' ? codeString : ''}
            />
            <Highlight
              theme={themes.nightOwl}
              code={typeof codeString === 'string' ? codeString.trim() : ''}
              language={language}
            >
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                  className={`${className} text-sm leading-6`}
                  style={{ ...style, background: 'transparent' }}
                >
                  {tokens.map((line, i) => (
                    <div
                      key={i}
                      {...getLineProps({ line, key: i })}
                      style={{ display: 'table-row' }}
                    >
                      <span
                        style={{
                          display: 'table-cell',
                          textAlign: 'right',
                          paddingRight: '1em',
                          userSelect: 'none',
                          opacity: 0.5,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ display: 'table-cell' }}>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token, key })} />
                        ))}
                      </span>
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          </div>
        </div>
      </div>
    );
  },
  code: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    if (!className) {
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono">
          {children}
        </code>
      );
    }
    return <code className={className}>{children}</code>;
  },
  // 其他组件样式
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-semibold mt-8 mb-3">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold mt-6 mb-2">{children}</h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="leading-7 mb-4">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="leading-7">{children}</li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-gray-200 dark:border-gray-700 pl-4 my-4 italic">
      {children}
    </blockquote>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto my-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
};

// 主要的文档页面组件
const DocPageClient = ({ doc }: { doc: any }) => {
  // 使用 React.useMemo 缓存渲染结果
  const content = React.useMemo(
    () => (
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={components}
        >
          {doc.body.raw}
        </ReactMarkdown>
      </article>
    ),
    [doc.body.raw]
  );

  return (
    <DocLayout>
      <div className="max-w-4xl px-6 py-10">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          {doc.title}
        </h1>
        {content}
      </div>
    </DocLayout>
  );
};

export default DocPageClient;

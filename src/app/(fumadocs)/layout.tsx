import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';

/**
 * Fumadocs 路由组的根布局
 * 用于 /docs 和 /blog 路由
 */

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://example.com';
}

export const metadata: Metadata = {
  title: {
    default: 'MvpFast 文档',
    template: '%s | MvpFast',
  },
  description: 'MvpFast 使用指南、API 文档和技术文章',
  keywords: '文档, 指南, API, 文章, MvpFast',
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    type: 'website',
    siteName: 'MvpFast Docs',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FumadocsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import './globals.css';
import { ReduxProvider } from '@/store';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProviders } from '@/components/theme/ThemeProvider';
const PageProgressBar = dynamic(() => import('@/components/PageProgressBar'), {
  ssr: false,
});

const inter = Inter({ subsets: ['latin'] });

const fonts = localFont({
  src: [
    {
      path: '../../public/fonts/xft.ttf',
    },
  ],
  variable: '--font-xft',
});

export const metadata: Metadata = {
  title: 'MvpFast-快速构建网站应用',
  description:
    '这是一款能帮助你快速构建个人网站的应用，使用最新的前端技术栈，集成登录、鉴权、手机、邮箱、数据库、博客、文章、支付等等网站所需要的功能，你只需要花几个小时开发你的核心功能就可以上线，一次购买，永久拥有',
  keywords:
    '开发模板 快速开发 NextJs React TailWindCss Mongdb Atlas wechat 微信体系 永久拥有 快速构建 NextAuth 网站开发 Saas模板 微信登录',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={cn(fonts.variable, inter.className)}>
        <PageProgressBar />
        <ThemeProviders attribute="data-theme" defaultTheme="light">
          <SessionProvider>
            <ReduxProvider>{children}</ReduxProvider>
          </SessionProvider>
        </ThemeProviders>
        <Toaster></Toaster>
        <Analytics></Analytics>
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=G-B315FBSZWP`}
        />
        <Script id="ga-script" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-B315FBSZWP');
          `}
        </Script>
      </body>
    </html>
  );
}

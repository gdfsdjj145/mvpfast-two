---
order: 2
key: preparation
title: 了解
description: 了解
---

**MvpFast** 使用以下主要技术：

1. [Next.js](https://nextjs.org/) - React 框架
2. [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
3. [Prisma](https://www.prisma.io/) - 下一代 ORM
4. [NextAuth.js](https://next-auth.js.org/) - 身份认证解决方案
5. [DaisyUI](https://daisyui.com/) - Tailwind CSS 组件库
6. [MongoDB Atlas](https://www.mongodb.com/zh-cn/cloud/atlas/register) - 数据库
7. [Vercel](https://vercel.com/) - 云平台
8. [GitHub](https://github.com/) - 代码托管平台
9. [微信开发](https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html) - 公众号开发

<br />

**MvpFast** 里面还包含了很多的组件文件，它们可以帮助你快速的构建自己想要的内容。

在`/components`文件夹里面你可以找到你需要的组件，包括但不限于 Hero、Price 等等组件，你可以看文档的**components** 部分。

根布局组件在`src/app/layout.tsx`，它是整个网站的最根部的布局组件，包含一些网站监听，数据传输，主题选择等等功能，你也可以通过**metadata**来做你的**seo**修改。

```tsx
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
import { SpeedInsights } from '@vercel/speed-insights/next';
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
        <SpeedInsights></SpeedInsights>
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=xxx`}
        />
        <Script id="ga-script" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'xxx');
          `}
        </Script>
      </body>
    </html>
  );
}
```

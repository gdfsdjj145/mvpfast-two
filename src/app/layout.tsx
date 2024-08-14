import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReduxProvider } from '@/store';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WeFight-一起奋斗吧！',
  description:
    'WeFight是一个通过互相打卡竞技排名的方式来完成目标的网站,通过创建目标任务群组,邀请好友进入群组,完成每天打卡任务,通过每天打卡的方式来培养好习惯和完成目标,适合健身、学习、读书、工作各种社交场景',
  keywords:
    '群组社交,打卡任务,健身群,活动群,读书群,学习群,比赛排行,一起完成任务,多人排名,培养习惯,21天养成好习惯',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="cmyk">
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
        <Toaster></Toaster>
        <Analytics></Analytics>
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=G-R392ZK8B1J`}
        />
        <Script id="ga-script" strategy="lazyOnload">
          {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-R392ZK8B1J');
      `}
        </Script>
      </body>
    </html>
  );
}

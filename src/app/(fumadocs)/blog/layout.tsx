import { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '../layout.config';

export async function generateMetadata() {
  return {
    title: 'MvpFast 知识博客',
    description: '一些分享内容',
    keywords: '知识博客, 分享内容',
    icons: {
      icon: '/favicons/icon_16x16.png',
    },
  };
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions}>
      {children}
    </HomeLayout>
  );
}

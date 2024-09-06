'use client';
import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginButtton = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await signOut({ redirect: false, callbackUrl: '/' });
    router.push(result.url);
  };

  if (status === 'unauthenticated' || status === 'loading') {
    return (
      <Link href="/auth/signin" className="text-sm font-semibold leading-6">
        登录<span aria-hidden="true">&rarr;</span>
      </Link>
    );
  }

  const renderName = () => {
    if (session?.user?.email) {
      return session?.user?.email.slice(0, 1);
    }
    if (session?.user?.phone) {
      return session?.user?.phone.slice(0, 1);
    }
    if (session?.user?.wechatOpenId) {
      return session?.user?.nickName.slice(0, 1);
    }
  };

  const renderAllName = () => {
    if (session?.user?.email) {
      return session?.user?.email;
    }
    if (session?.user?.phone) {
      return session?.user?.phone;
    }
    if (session?.user?.wechatOpenId) {
      return session?.user?.nickName;
    }
  };

  return (
    <div className="flex justify-center items-center gap-4">
      <div className="avatar placeholder">
        <div className="bg-neutral text-neutral-content w-12 rounded-full">
          <span>{renderName()}</span>
        </div>
      </div>
      <div>{renderAllName()}</div>
      <button className="btn" onClick={handleLogout}>
        退出
      </button>
    </div>
  );
};

export default function Header() {
  const navigation = [
    {
      name: '首页',
      href: '/',
    },
    {
      name: '文档',
      href: '/docs',
    },
    {
      name: '博客',
      href: '/blog',
    },
    {
      name: '价格',
      href: '#price',
    },
    {
      name: '购买须知',
      href: '/blog/commercial',
    },
    {
      name: '关于我们',
      href: 'https://www.islandspage.com/EM-T',
      target: '_blank',
      rel: 'external',
    },
  ];

  return (
    <header>
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">MvpFast</span>
            <img alt="" src="/title-logo.png" className="h-12 w-auto" />
          </a>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 "
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <LoginButtton />
        </div>
      </nav>
    </header>
  );
}

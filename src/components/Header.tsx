'use client';
import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { renderText } from '@/app/lib/utils';
import { selectInfo } from '@/store/user';
import { useAppSelector, useAppDispatch } from '@/store/hook';
import { setInfo } from '@/store/user';

export default function Header() {
  const dispatch = useAppDispatch();
  const info = useAppSelector(selectInfo);

  // const session = useSession();

  // console.log(session);

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
            <span className="sr-only">Your Company</span>
            <img
              alt=""
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
              className="h-8 w-auto"
            />
          </a>
        </div>
        {/* <div className="flex lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
        >
          <span className="sr-only">Open main menu</span>
          <Bars3Icon aria-hidden="true" className="h-6 w-6" />
        </button>
      </div> */}
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
          <a href="/auth/signin" className="text-sm font-semibold leading-6 ">
            登录<span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
    </header>
  );
}

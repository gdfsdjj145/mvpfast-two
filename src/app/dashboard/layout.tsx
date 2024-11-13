'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';
import { TbReportMoney } from 'react-icons/tb';
import { GoShareAndroid } from 'react-icons/go';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname().split('/').filter(Boolean).pop() || '';

  console.log(pathname);

  const tabList = [
    {
      label: '购买记录',
      key: 'order',
      icon: (
        <TbReportMoney
          size={20}
          className="group-hover:mr-2 group-hover:-rotate-45 transition-all"
        ></TbReportMoney>
      ),
    },
    {
      label: '推广记录',
      key: 'share',
      icon: (
        <GoShareAndroid
          size={20}
          className="group-hover:mr-2 group-hover:-rotate-45 transition-all"
        ></GoShareAndroid>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box mb-3 gap-2">
          {tabList.map((tab) => (
            <li
              key={tab.key}
              className={`${
                tab.key === pathname ? 'bg-secondary/50 font-bold' : ''
              } rounded-xl`}
            >
              <a className="flex gap-2 group" href={`/dashboard/${tab.key}`}>
                {tab.icon}
                <span className="group-hover:scale-105 transition-all">
                  {tab.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;

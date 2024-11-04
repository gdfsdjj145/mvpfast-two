'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TbReportMoney } from 'react-icons/tb';
import { GoShareAndroid } from 'react-icons/go';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box mb-3">
          <li>
            <a className="flex gap-2 group" href="/dashboard/order">
              <TbReportMoney
                size={20}
                className="group-hover:mr-2 group-hover:-rotate-45 transition-all"
              ></TbReportMoney>
              <span className="group-hover:scale-105 transition-all">
                购买记录
              </span>
            </a>
          </li>
          <li>
            <a className="flex gap-2 group" href="/dashboard/share">
              <GoShareAndroid
                size={20}
                className="group-hover:mr-2 group-hover:-rotate-45 transition-all"
              ></GoShareAndroid>
              <span className="group-hover:scale-105 transition-all">
                推广记录
              </span>
            </a>
          </li>
        </ul>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;

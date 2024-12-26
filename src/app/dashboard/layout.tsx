'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ImAccessibility } from 'react-icons/im';
import { TbReportMoney } from 'react-icons/tb';
import { GoShareAndroid } from 'react-icons/go';
import { IoGiftOutline } from 'react-icons/io5';
import { Database, BarChart2 } from 'lucide-react';
import { User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Layout,
  Sun,
  LogOut,
  Home,
  FileText,
  ChevronUp,
} from 'lucide-react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const currentPath =
    pathname === '/dashboard'
      ? 'home'
      : pathname.split('/').filter(Boolean).pop() || 'home';
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(session?.user);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const result = await signOut({ redirect: false, callbackUrl: '/' });
    router.push(result.url);
  };

  // 渲染头像
  const renderName = () => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt="头像"
          className="w-full h-full object-cover"
        />
      );
    }
    if (user?.nickName) return user.nickName[0];
    return '?';
  };

  const renderUserType = () => {
    if (user?.email) return '邮箱用户';
    if (user?.phone) return '手机用户';
    if (user?.wechatOpenId) return '微信用户';
    return '未知';
  };

  const renderFullName = () => {
    if (user?.email) return user.email;
    if (user?.phone) return user.phone;
    if (user?.wechatOpenId) return user.nickName;
    return '未知用户';
  };

  const tabList = [
    {
      label: '仪表盘',
      key: 'home',
      description: '数据统计和分析demo',
      icon: <BarChart2 size={20} />,
    },
    {
      label: '数据库操作展示',
      key: 'dbdemo',
      description: '数据库增删改查demo',
      icon: <Database size={20} />,
    },
    {
      label: '购买操作展示',
      key: 'order',
      description: '模拟购买操作demo',
      icon: (
        <TbReportMoney
          size={20}
          className="group-hover:mr-2 group-hover:-rotate-45 transition-all"
        ></TbReportMoney>
      ),
    },
    {
      label: '个人信息',
      key: 'person',
      icon: <User size={20} />,
    },
  ];

  const menuItems = [
    {
      label: '购买',
      icon: <IoGiftOutline size={16} />,
      href: '/#price',
    },
    {
      label: '文档',
      icon: <FileText size={16} />,
      href: '/docs/introduction',
      target: '_blank',
    },
    { label: '首页', icon: <Home size={16} />, href: '/' },
  ];

  return (
    <div className="min-h-screen bg-base-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-base-200 min-h-screen flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-base-300">
          <a href="/" className="normal-case text-xl p-0">
            <img alt="MvpFast" src="/title-logo.png" className="h-10 w-auto" />
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="menu menu-md gap-2">
            {tabList.map((tab) => (
              <li
                key={tab.key}
                className={`${
                  currentPath === tab.key ? 'bg-secondary/50 font-bold' : ''
                } rounded-xl`}
              >
                <Link
                  href={`/dashboard/${tab.key}`}
                  className="flex items-center gap-2"
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile with Dropdown */}
        <div className="border-t border-base-300 p-4 relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 w-full hover:bg-base-300 p-2 rounded-lg transition-colors"
          >
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center text-base">
                  <span>{renderName()}</span>
                </div>
              </div>
            </label>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-medium truncate">{renderFullName()}</div>
              <div className="text-xs text-base-content/70 truncate">
                {renderUserType()}
              </div>
            </div>
            <ChevronUp
              size={18}
              className={`text-base-content/70 transition-transform duration-200 ${
                isMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-base-100 rounded-box shadow-lg border border-base-300">
              <ul className="menu menu-sm p-2 gap-1">
                {menuItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.target}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-base-200 rounded-lg"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="/"
                    className="button button-ghost flex items-center gap-2 px-4 py-2 hover:bg-base-200 rounded-lg"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>退出</span>
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-screen">
        <main className="h-full overflow-y-auto scrollbar-style">
          <div className="p-6 container mx-auto max-w-5xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold">
                {tabList.find((tab) => tab.key === currentPath)?.label ||
                  'Dashboard'}
              </h1>
              <p className="text-sm text-base-content/70 mt-2">
                {tabList.find((tab) => tab.key === currentPath)?.description ||
                  ''}
              </p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

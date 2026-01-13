'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { TbReportMoney } from 'react-icons/tb';
import { IoGiftOutline, IoSearchOutline } from 'react-icons/io5';
import {
  Database,
  BarChart2,
  User,
  LogOut,
  Home,
  FileText,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Bell,
  Menu,
  X,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations('Dashboard');
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentPath = pathSegments[pathSegments.length - 1] || 'home';

  const { data: session, status } = useSession();
  const router = useRouter();

  // 开发环境模拟用户
  const devUser = {
    id: 'dev-user',
    email: 'dev@mvpfast.top',
    phone: null,
    wechatOpenId: null,
    nickName: 'Dev User',
    avatar: null,
  };

  const isDev = process.env.NODE_ENV === 'development';
  const [user, setUser] = useState(session?.user || (isDev ? devUser : undefined));

  const [collapsed, setCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else if (isDev) {
      setUser(devUser);
    }
  }, [session, isDev]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
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
  const renderAvatar = () => {
    if (user?.avatar) {
      return (
        <Image
          src={user.avatar}
          alt="头像"
          width={40}
          height={40}
          className="w-full h-full object-cover rounded-full"
        />
      );
    }
    const initial = user?.nickName?.[0] || user?.email?.[0] || '?';
    return (
      <div className="w-full h-full bg-primary text-white flex items-center justify-center font-semibold text-sm rounded-full">
        {initial.toUpperCase()}
      </div>
    );
  };

  const renderUserType = () => {
    if (user?.email) return '邮箱用户';
    if (user?.phone) return '手机用户';
    if (user?.wechatOpenId) return '微信用户';
    return '游客';
  };

  const renderFullName = () => {
    if (user?.nickName) return user.nickName;
    if (user?.email) return user.email;
    if (user?.phone) return user.phone;
    return '未知用户';
  };

  // 项目主题色 #9462ff
  const menuGroups = [
    {
      title: t('main'),
      items: [
        {
          label: t('tabs.home.title'),
          key: 'home',
          description: t('tabs.home.description'),
          icon: <BarChart2 size={20} />,
        },
        {
          label: t('tabs.dbdemo.title'),
          key: 'dbdemo',
          description: t('tabs.dbdemo.description'),
          icon: <Database size={20} />,
        },
      ],
    },
    {
      title: t('business'),
      items: [
        {
          label: t('tabs.order.title'),
          key: 'order',
          description: t('tabs.order.description'),
          icon: <TbReportMoney size={20} />,
        },
        {
          label: t('tabs.person.title'),
          key: 'person',
          description: t('tabs.person.description'),
          icon: <User size={20} />,
        },
      ],
    },
  ];

  const menuItems = [
    {
      label: t('menu.buy.label'),
      icon: <IoGiftOutline size={18} />,
      href: '/#price',
    },
    {
      label: t('menu.docs.label'),
      icon: <FileText size={18} />,
      href: '/docs/introduction',
      target: '_blank',
    },
    { label: t('menu.home.label'), icon: <Home size={18} />, href: '/' },
  ];

  // 模拟通知数据
  const notifications = [
    { id: 1, title: '系统更新', content: '系统已更新至最新版本', time: '刚刚', read: false },
    { id: 2, title: '新消息', content: '您有一条新的消息', time: '10分钟前', read: false },
    { id: 3, title: '任务完成', content: '您的任务已完成', time: '1小时前', read: true },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 生成面包屑
  const renderBreadcrumbs = () => {
    const segments = pathname
      .split('/')
      .filter(Boolean)
      .filter((segment) => segment !== 'zh' && segment !== 'en' && segment !== 'dashboard');
    return (
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
          首页
        </Link>
        {segments.map((segment, index) => {
          const path = `/${['dashboard', ...segments.slice(0, index + 1)].join('/')}`;
          const isLast = index === segments.length - 1;
          const label =
            menuGroups.flatMap((group) => group.items).find((item) => item.key === segment)?.label || segment;

          return (
            <React.Fragment key={path}>
              <ChevronRight size={14} className="text-gray-400" />
              {isLast ? (
                <span className="font-medium text-gray-900">{label}</span>
              ) : (
                <Link href={path} className="text-gray-500 hover:text-gray-700 transition-colors">
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  };

  // 获取当前页面的图标和渐变色
  const currentPageInfo = menuGroups.flatMap((group) => group.items).find((item) => item.key === currentPath);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-20' : 'w-72'} bg-white h-screen flex flex-col transition-all duration-300 ease-in-out z-50 sticky top-0
        ${mobileMenuOpen ? 'fixed left-0' : 'hidden lg:flex'} border-r border-gray-200`}
      >
        {/* Logo */}
        <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-primary">
                MvpFast
              </span>
            </Link>
          ) : (
            <Link href="/" className="w-full flex justify-center">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Sparkles size={20} className="text-white" />
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${collapsed ? 'hidden' : ''}`}
          >
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {!collapsed && (
                <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = currentPath === item.key;
                  return (
                    <li key={item.key}>
                      <Link
                        href={`/dashboard/${item.key}`}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                          ${isActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'text-gray-600 hover:bg-gray-100'
                          }
                          ${collapsed ? 'justify-center' : ''}
                        `}
                      >
                        <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="font-medium">{item.label}</span>
                        )}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse toggle for collapsed state */}
        {collapsed && (
          <div className="px-3 py-2 border-t border-gray-100">
            <button
              onClick={() => setCollapsed(false)}
              className="w-full h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>
        )}

        {/* User Profile */}
        <div className="border-t border-gray-100 p-3" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-100 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 flex-shrink-0">
              {renderAvatar()}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium text-gray-900 truncate text-sm">{renderFullName()}</div>
                  <div className="text-xs text-gray-500 truncate">{renderUserType()}</div>
                </div>
                <ChevronUp
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${isMenuOpen ? '' : 'rotate-180'}`}
                />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div
              className={`absolute ${collapsed ? 'left-20 bottom-4' : 'bottom-full left-3 right-3'} mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden`}
            >
              <div className="p-4 bg-primary/10 border-b border-gray-100">
                <div className="font-semibold text-gray-900">{renderFullName()}</div>
                <div className="text-sm text-gray-500">{renderUserType()}</div>
              </div>
              <ul className="p-2">
                {menuItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.target}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-700"
                    >
                      <span className="text-gray-400">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </a>
                  </li>
                ))}
                <li className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl transition-colors text-red-600 w-full"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">退出登录</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Mobile menu toggle */}
            <button
              className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center lg:hidden transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md">
              <div className="relative w-full">
                <IoSearchOutline size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-primary transition-all text-sm"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors relative"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell size={20} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">通知</span>
                      <button className="text-sm text-primary hover:text-primary/80 font-medium">
                        全部已读
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                            notification.read ? '' : 'bg-primary/5'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-gray-900">{notification.title}</span>
                            <span className="text-xs text-gray-400">{notification.time}</span>
                          </div>
                          <p className="text-sm text-gray-600">{notification.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-gray-100">
                      <button className="text-sm text-primary hover:text-primary/80 font-medium">
                        查看全部通知
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Settings size={20} className="text-gray-600" />
              </button>

              {/* User avatar - Mobile */}
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 lg:hidden">
                {renderAvatar()}
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <div className="mb-6">{renderBreadcrumbs()}</div>

            {/* Page header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                {currentPageInfo && (
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="text-white">{currentPageInfo.icon}</span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {currentPageInfo?.label || '控制台'}
                  </h1>
                  <p className="text-gray-500 mt-1">{currentPageInfo?.description || ''}</p>
                </div>
              </div>
            </div>

            {/* Page content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 bg-white border-t border-gray-100 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} MvpFast. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;

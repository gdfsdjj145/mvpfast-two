'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TbReportMoney } from 'react-icons/tb';
import { IoGiftOutline } from 'react-icons/io5';
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
  const [user, setUser] = useState(session?.user);

  const [collapsed, setCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
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
      ]
    },
    {
      title: t('business'),
      items: [
        {
          label: t('tabs.order.title'),
          key: 'order',
          description: t('tabs.order.description'),
          icon: (
            <TbReportMoney
              size={20}
              className="group-hover:mr-2 group-hover:-rotate-45 transition-all"
            ></TbReportMoney>
          ),
        },
        {
          label: t('tabs.person.title'),
          key: 'person',
          description: t('tabs.person.description'),
          icon: <User size={20} />,
        },
      ]
    }
  ];

  const menuItems = [
    {
      label: t('menu.buy.label'),
      icon: <IoGiftOutline size={16} />,
      href: '/#price',
    },
    {
      label: t('menu.docs.label'),
      icon: <FileText size={16} />,
      href: '/docs/introduction',
      target: '_blank',
    },
    { label: t('menu.home.label'), icon: <Home size={16} />, href: '/' },
  ];

  // 模拟通知数据
  const notifications = [
    { id: 1, title: '系统更新', content: '系统已更新至最新版本', time: '刚刚', read: false },
    { id: 2, title: '新消息', content: '您有一条新的消息', time: '10分钟前', read: false },
    { id: 3, title: '任务完成', content: '您的任务已完成', time: '1小时前', read: true },
  ];

  // 生成面包屑
  const renderBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean).filter(segment => segment !== 'zh' && segment !== 'dashboard');
    return (
      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link href="/" className="hover:underline">首页</Link></li>
          {segments.map((segment, index) => {
            const path = `/${['dashboard', ...segments.slice(0, index + 1)].join('/')}`;
            const isLast = index === segments.length - 1;
            const label = menuGroups.flatMap(group => group.items).find(item => item.key === segment)?.label || segment;
            
            return (
              <li key={path}>
                {isLast ? (
                  <span className="font-medium">{label}</span>
                ) : (
                  <Link href={path} className="hover:underline">{label}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-base-100 flex ${isDarkMode ? 'dark' : ''}`}>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)}>
        </div>
      )}

      {/* Sidebar */}
      <div 
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } bg-base-200 min-h-screen flex flex-col transition-all duration-300 ease-in-out z-50 
        ${mobileMenuOpen ? 'fixed h-full left-0' : 'hidden lg:flex'} shadow-lg`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between overflow-hidden">
          {!collapsed && (
            <div className="flex items-center gap-2 transition-all duration-300 ease-in-out">
              <a href="/" className="flex-shrink-0">
                <img alt="MvpFast" src="/favicons/icon_128x128.png" className="h-10 w-auto" />
              </a>
              <span className="text-xl font-bold whitespace-nowrap transition-opacity duration-300 ease-in-out">MvpFast</span>
            </div>
          )}
          {collapsed && (
            <a href="/" className="flex-1 flex justify-center transition-all duration-300 ease-in-out">
              <img alt="MvpFast" src="/favicons/icon_64x64.png" className="h-8 w-8" />
            </a>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="btn btn-sm btn-ghost btn-square flex-shrink-0"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4 w-full transition-all duration-300 ease-in-out">
              {!collapsed && (
                <div className="px-3 py-2 text-xs font-semibold text-base-content/60 uppercase tracking-wider transition-opacity duration-300 ease-in-out">
                  {group.title}
                </div>
              )}
              <ul className="menu menu-sm gap-1 w-full">
                {group.items.map((item) => (
                  <li
                    key={item.key}
                    className={`${
                      currentPath === item.key ? 'bg-primary text-primary-content' : ''
                    } rounded-lg hover:bg-base-300 transition-colors w-full`}
                  >
                    <Link
                      href={`/dashboard/${item.key}`}
                      className={`flex items-center gap-3 py-2 w-full transition-all duration-300 ease-in-out ${collapsed ? 'justify-center' : ''}`}
                    >
                      <span className="text-base flex-none transition-transform duration-300 ease-in-out">{item.icon}</span>
                      {!collapsed && <span className="transition-opacity duration-300 ease-in-out whitespace-nowrap">{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile with Dropdown */}
        <div className="border-t border-base-300 p-2 relative transition-all duration-300 ease-in-out" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-3 w-full hover:bg-base-300 p-2 rounded-lg transition-all duration-300 ease-in-out ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="avatar flex-shrink-0">
              <div className="w-10 rounded-full">
                <div className="w-full h-full bg-neutral text-neutral-content flex items-center justify-center text-base">
                  <span>{renderName()}</span>
                </div>
              </div>
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left transition-opacity duration-300 ease-in-out">
                  <div className="font-medium truncate text-sm">{renderFullName()}</div>
                  <div className="text-xs text-base-content/70 truncate">
                    {renderUserType()}
                  </div>
                </div>
                <ChevronUp
                  size={18}
                  className={`text-base-content/70 transition-transform duration-300 ease-in-out ${
                    isMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className={`absolute ${collapsed ? 'left-16 bottom-0' : 'bottom-full left-2 right-2'} mb-2 bg-base-100 rounded-box shadow-lg border border-base-300 z-50 transition-all duration-300 ease-in-out`}>
              <div className="p-3 border-b border-base-200">
                <div className="font-semibold">{renderFullName()}</div>
                <div className="text-xs text-base-content/70">{renderUserType()}</div>
              </div>
              <ul className="menu menu-sm p-2 gap-1 w-full">
                {menuItems.map((item) => (
                  <li key={item.label} className="w-full">
                    <a
                      href={item.href}
                      target={item.target}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-base-200 rounded-lg w-full transition-colors duration-200"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
                <li className="w-full">
                  <a
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-base-200 rounded-lg text-error w-full transition-colors duration-200"
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
      <div className="flex-1 flex flex-col h-screen">
        {/* Top Navigation Bar */}
        <header className="bg-base-100 border-b border-base-300 shadow-sm z-30">
          <div className="px-4 py-2 flex items-center justify-between">
            {/* Mobile menu toggle */}
            <button
              className="btn btn-ghost btn-square lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Spacer to push notifications to the right on desktop */}
            <div className="hidden lg:flex flex-1"></div>
            
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  className="btn btn-ghost btn-circle indicator transition-all duration-300 ease-in-out" 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell size={20} />
                  <span className="indicator-item badge badge-xs badge-primary transition-all duration-300 ease-in-out">{notifications.filter(n => !n.read).length}</span>
                </button>
                
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-box shadow-lg border border-base-300 z-50 transition-all duration-300 ease-in-out">
                    <div className="p-3 border-b border-base-200 font-medium flex justify-between items-center">
                      <span>通知</span>
                      <button className="text-xs text-primary transition-colors duration-200">全部标为已读</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`p-3 border-b border-base-200 hover:bg-base-200/50 cursor-pointer transition-colors duration-200 ${notification.read ? '' : 'bg-base-200/30'}`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{notification.title}</span>
                              <span className="text-xs text-base-content/60">{notification.time}</span>
                            </div>
                            <p className="text-sm mt-1 text-base-content/80">{notification.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-base-content/60">
                          暂无通知
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-center border-t border-base-200">
                      <button className="text-sm text-primary transition-colors duration-200">查看全部</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-base-200/50">
          <div className="p-4 md:p-6 max-w-6xl">
            {/* Breadcrumbs */}
            <div className="mb-4">
              {renderBreadcrumbs()}
            </div>
            
            {/* Page header */}
            <div className="mb-6 bg-base-100 rounded-box p-5 shadow-sm">
              <h1 className="text-2xl md:text-3xl font-bold">
                {menuGroups.flatMap(group => group.items).find(item => item.key === currentPath)?.label || '控制台'}
              </h1>
              <p className="text-sm text-base-content/70 mt-2">
                {menuGroups.flatMap(group => group.items).find(item => item.key === currentPath)?.description || ''}
              </p>
            </div>
            
            {/* Page content */}
            <div className="bg-base-100 rounded-box p-5 shadow-sm">
              {children}
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="p-3 bg-base-100 border-t border-base-300 text-center text-sm text-base-content/70">
          © {new Date().getFullYear()} MvpFast 管理系统 - 版权所有
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;

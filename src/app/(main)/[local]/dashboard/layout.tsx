'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { TbReportMoney } from 'react-icons/tb';
import { IoGiftOutline } from 'react-icons/io5';
import {
  User,
  Users,
  LogOut,
  Home,
  FileText,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Settings,
  UserCog,
  Ticket,
  Coins,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSiteConfig } from '@/hooks/useSiteConfig';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations('Dashboard');
  const { siteConfig } = useSiteConfig();
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  // 获取 dashboard 之后的路径作为当前路径
  const dashboardIndex = pathSegments.indexOf('dashboard');
  const currentPath = dashboardIndex >= 0
    ? pathSegments.slice(dashboardIndex + 1).join('/') || 'users'
    : 'users';

  const { data: session, status, update } = useSession();
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

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else if (isDev) {
      setUser(devUser);
    }
  }, [session, isDev]);

  // Session 过期检测和重定向
  useEffect(() => {
    // 跳过开发环境
    if (isDev) return;

    // 等待 session 加载完成
    if (status === 'loading') return;

    // 如果 session 状态为 unauthenticated，先尝试刷新 session
    // 因为 SessionProvider 的状态可能滞后于实际的 cookie 状态
    if (status === 'unauthenticated') {
      update().then((refreshed) => {
        if (!refreshed) {
          console.log('[Dashboard] Session expired, redirecting to login');
          const currentPath = window.location.pathname + window.location.search;
          router.replace(`/auth/signin?redirect=${encodeURIComponent(currentPath)}`);
        }
      });
    }
  }, [status, isDev, router, update]);

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

  const renderFullName = () => {
    if (user?.nickName) return user.nickName;
    return '未知用户';
  };

  // 用户角色 - 在 session 加载中时，保持上一次的角色状态避免菜单闪烁
  // 开发环境默认为 admin，生产环境在加载完成前保持 undefined
  const [cachedRole, setCachedRole] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      setCachedRole(session.user.role);
    }
  }, [status, session?.user?.role]);

  // 确定当前角色：优先使用 session 中的角色，其次使用缓存的角色，开发环境默认 admin
  const userRole = session?.user?.role || cachedRole || (isDev ? 'admin' : 'user');
  const isAdmin = userRole === 'admin';

  // 需要管理员权限的路径
  const adminOnlyPaths = ['users', 'order', 'redemption', 'settings/system', 'posts'];

  // 检查当前路径是否需要管理员权限
  useEffect(() => {
    if (status === 'loading') return;

    const needsAdmin = adminOnlyPaths.some((path) => currentPath === path || currentPath.startsWith(path + '/'));

    if (needsAdmin && !isAdmin) {
      // 非管理员访问管理页面，重定向到 403
      router.replace('/403');
    }
  }, [currentPath, isAdmin, status, router]);

  // 项目主题色 #9462ff
  const allMenuGroups = [
    {
      title: '概览',
      items: [
        {
          label: '仪表盘',
          key: 'home',
          description: '查看个人积分和消费概览',
          icon: <LayoutDashboard size={20} />,
          adminOnly: false,
        },
        {
          label: '我的订单',
          key: 'my-orders',
          description: '查看我的购买订单记录',
          icon: <TbReportMoney size={20} />,
          adminOnly: false,
        },
        {
          label: '积分记录',
          key: 'credits',
          description: '查看积分变动记录',
          icon: <Coins size={20} />,
          adminOnly: false,
        },
      ],
    },
    {
      title: '管理功能',
      adminOnly: true,
      items: [
        {
          label: '用户管理',
          key: 'users',
          description: '管理系统用户和积分',
          icon: <Users size={20} />,
          adminOnly: true,
        },
        {
          label: '订单管理',
          key: 'order',
          description: '查看和管理订单记录',
          icon: <TbReportMoney size={20} />,
          adminOnly: true,
        },
        {
          label: '兑换码管理',
          key: 'redemption',
          description: '创建和管理积分兑换码',
          icon: <Ticket size={20} />,
          adminOnly: true,
        },
        {
          label: '文章管理',
          key: 'posts',
          description: '创建和管理博客文章',
          icon: <FileText size={20} />,
          adminOnly: true,
        },
      ],
    },
    {
      title: '系统功能',
      adminOnly: true,
      items: [
        {
          label: '系统配置',
          key: 'settings/system',
          description: '管理系统运行时配置',
          icon: <Settings size={20} />,
          adminOnly: true,
        },
      ],
    },
    {
      title: 'AI 工具',
      items: [
        {
          label: 'AI Chat',
          key: 'ai-chat',
          description: '与 AI 模型进行对话',
          icon: <MessageSquare size={20} />,
          adminOnly: false,
        },
      ],
    },
    {
      title: '个人功能',
      items: [
        {
          label: t('tabs.person.title'),
          key: 'person',
          description: t('tabs.person.description'),
          icon: <User size={20} />,
          adminOnly: false,
        },
      ],
    },
  ];

  // 根据角色过滤菜单
  const menuGroups = allMenuGroups
    .filter((group) => !group.adminOnly || isAdmin)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((group) => group.items.length > 0);

  const menuItems = [
    {
      label: '个人设置',
      icon: <UserCog size={16} />,
      href: '/dashboard/person',
    },
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

  // 生成面包屑
  const renderBreadcrumbs = () => {
    if (!currentPath) return null;

    // 查找当前页面对应的菜单项
    const currentMenuItem = menuGroups
      .flatMap((group) => group.items)
      .find((item) => item.key === currentPath);

    return (
      <div className="breadcrumbs text-sm">
        <ul>
          {/* 控制台首页 */}
          <li>
            <Link
              href="/dashboard/home"
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
            >
              <Home size={14} />
              <span>控制台</span>
            </Link>
          </li>

          {/* 当前页面 */}
          {currentMenuItem ? (
            <li>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 text-primary font-medium">
                <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{currentMenuItem.icon}</span>
                <span>{currentMenuItem.label}</span>
              </span>
            </li>
          ) : (
            <li>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 text-primary font-medium">
                {currentPath}
              </span>
            </li>
          )}
        </ul>
      </div>
    );
  };

  // 获取当前页面的图标和渐变色
  const currentPageInfo = menuGroups.flatMap((group) => group.items).find((item) => item.key === currentPath);

  // 非开发环境下，如果正在加载或未认证，显示加载状态
  // 开发环境下，如果正在加载也显示加载状态（避免菜单闪烁）
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/60">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isDev && status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/60">正在跳转到登录页...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-20' : 'w-72'} bg-base-100 h-screen flex flex-col transition-all duration-300 ease-in-out z-50 sticky top-0
        ${mobileMenuOpen ? 'fixed left-0' : 'hidden lg:flex'} border-r border-base-300`}
      >
        {/* Logo */}
        <div className="h-16 px-4 border-b border-base-300 flex items-center justify-between">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                <img src="/favicon.ico" alt={siteConfig.siteName} className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold text-primary">
                {siteConfig.siteName}
              </span>
            </Link>
          ) : (
            <Link href="/" className="w-full flex justify-center">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                <img src="/favicon.ico" alt={siteConfig.siteName} className="w-full h-full object-contain" />
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-8 h-8 rounded-lg hover:bg-base-200 flex items-center justify-center transition-colors ${collapsed ? 'hidden' : ''}`}
          >
            <ChevronLeft size={18} className="text-base-content/60" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {!collapsed && (
                <div className="px-3 mb-2 text-xs font-semibold text-base-content/40 uppercase tracking-wider">
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
                            ? 'bg-primary text-primary-content shadow-lg shadow-primary/30'
                            : 'text-base-content/70 hover:bg-base-200'
                          }
                          ${collapsed ? 'justify-center' : ''}
                        `}
                      >
                        <span className={`flex-shrink-0 ${isActive ? 'text-primary-content' : 'text-base-content/60 group-hover:text-base-content'}`}>
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="font-medium">{item.label}</span>
                        )}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-3 py-2 bg-base-content text-base-100 text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
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
          <div className="px-3 py-2 border-t border-base-300">
            <button
              onClick={() => setCollapsed(false)}
              className="w-full h-10 rounded-xl hover:bg-base-200 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={18} className="text-base-content/60" />
            </button>
          </div>
        )}

        {/* User Profile */}
        <div className="border-t border-base-300 p-3 relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-base-200 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-base-300 flex-shrink-0">
              {renderAvatar()}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium text-base-content truncate text-sm">{renderFullName()}</div>
                </div>
                <ChevronUp
                  size={18}
                  className={`text-base-content/40 transition-transform duration-200 ${isMenuOpen ? '' : 'rotate-180'}`}
                />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div
              className={`absolute ${collapsed ? 'left-20 bottom-4 w-64' : 'bottom-full left-3 right-3'} mb-2 bg-base-100 rounded-xl shadow-2xl border border-base-300 z-50 overflow-hidden`}
            >
              {/* User Info Header */}
              <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-base-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/30">
                    {renderAvatar()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base-content text-sm truncate">{renderFullName()}</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <ul className="p-1.5">
                {/* Settings Section */}
                <li className="px-2 py-1 text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                  设置
                </li>
                {menuItems.slice(0, 1).map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-base-200 rounded-lg transition-colors text-base-content text-sm"
                    >
                      <span className="text-base-content/60">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                ))}

                {/* Divider */}
                <div className="divider my-1"></div>

                {/* Quick Links Section */}
                <li className="px-2 py-1 text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                  快捷链接
                </li>
                {menuItems.slice(1).map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.target}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-base-200 rounded-lg transition-colors text-base-content text-sm"
                    >
                      <span className="text-base-content/60">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </a>
                  </li>
                ))}

                {/* Divider */}
                <div className="divider my-1"></div>

                {/* Logout */}
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-error/10 rounded-lg transition-colors text-error w-full text-sm"
                  >
                    <LogOut size={16} />
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
        <header className="h-16 bg-base-100 border-b border-base-300 sticky top-0 z-30">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Mobile menu toggle */}
            <button
              className="w-10 h-10 rounded-xl hover:bg-base-200 flex items-center justify-center lg:hidden transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Breadcrumbs - Desktop */}
            <div className="hidden lg:flex flex-1">
              {renderBreadcrumbs()}
            </div>

            {/* User avatar - Mobile */}
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-base-300 lg:hidden">
              {renderAvatar()}
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-base-100">
          <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
            {/* Page header */}
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-base-content">
                {currentPageInfo?.label || '控制台'}
              </h1>
              {currentPageInfo?.description && (
                <p className="text-base-content/60 text-sm mt-0.5">{currentPageInfo.description}</p>
              )}
            </div>

            {/* Page content */}
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 bg-base-100 border-t border-base-300 text-center text-sm text-base-content/60">
          © {new Date().getFullYear()} {siteConfig.siteName}. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;

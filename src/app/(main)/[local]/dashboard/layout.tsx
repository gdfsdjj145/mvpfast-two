'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  ShieldCheck,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { hasPermission, type Permission } from '@/lib/auth/rbac';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { config } from '@/config';

// 开发环境模拟用户 - 移到组件外部避免每次渲染重新创建
const DEV_USER = {
  id: 'dev-user',
  email: 'dev@mvpfast.top',
  phone: null,
  wechatOpenId: null,
  nickName: 'Dev User',
  avatar: null,
} as const;

// 菜单配置常量 - 静态数据移到组件外部
// creditsOnly: true 表示仅在积分模式下显示
const MENU_CONFIG = {
  overview: {
    title: '概览',
    items: [
      { key: 'home', labelKey: '仪表盘', description: '查看个人积分和消费概览', iconName: 'LayoutDashboard', creditsOnly: true },
      { key: 'my-orders', labelKey: '我的订单', description: '查看我的购买订单记录', iconName: 'TbReportMoney' },
      { key: 'credits', labelKey: '积分记录', description: '查看积分变动记录', iconName: 'Coins', creditsOnly: true },
    ],
  },
  admin: {
    title: '管理功能',
    permission: 'user:list' as Permission,
    items: [
      { key: 'users', labelKey: '用户管理', description: '管理系统用户和积分', iconName: 'Users', permission: 'user:list' as Permission },
      { key: 'roles', labelKey: '角色管理', description: '查看角色权限配置', iconName: 'ShieldCheck', permission: 'user:edit' as Permission },
      { key: 'order', labelKey: '订单管理', description: '查看和管理订单记录', iconName: 'TbReportMoney', permission: 'order:list' as Permission },
      { key: 'redemption', labelKey: '兑换码管理', description: '创建和管理积分兑换码', iconName: 'Ticket', permission: 'redemption:manage' as Permission, creditsOnly: true },
      { key: 'posts', labelKey: '文章管理', description: '创建和管理博客文章', iconName: 'FileText', permission: 'post:manage' as Permission },
    ],
  },
  system: {
    title: '系统功能',
    permission: 'system:manage' as Permission,
    items: [
      { key: 'settings/system', labelKey: '系统配置', description: '管理系统运行时配置', iconName: 'Settings', permission: 'system:manage' as Permission },
    ],
  },
  ai: {
    title: 'AI 工具',
    items: [
      { key: 'ai-chat', labelKey: 'AI Chat', description: '与 AI 模型进行对话', iconName: 'MessageSquare' },
    ],
  },
  personal: {
    title: '个人功能',
    items: [
      { key: 'person', labelKey: 'tabs.person.title', description: 'tabs.person.description', iconName: 'User', useTranslation: true },
    ],
  },
} as const;

// 图标映射
const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  TbReportMoney: <TbReportMoney size={20} />,
  Coins: <Coins size={20} />,
  Users: <Users size={20} />,
  ShieldCheck: <ShieldCheck size={20} />,
  Ticket: <Ticket size={20} />,
  FileText: <FileText size={20} />,
  Settings: <Settings size={20} />,
  MessageSquare: <MessageSquare size={20} />,
  User: <User size={20} />,
};

const IS_DEV = process.env.NODE_ENV === 'development';

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

  const [user, setUser] = useState(session?.user || (IS_DEV ? DEV_USER : undefined));

  const [collapsed, setCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else if (IS_DEV) {
      setUser(DEV_USER);
    }
  }, [session]);

  // Session 过期检测和重定向
  useEffect(() => {
    // 跳过开发环境
    if (IS_DEV) return;

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
  }, [status, router, update]);

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
  const userRole = session?.user?.role || cachedRole || (IS_DEV ? 'admin' : 'user');

  // 是否为积分模式
  const isCreditsMode = config.purchaseMode === 'credits';

  // 使用 useMemo 构建菜单组，避免每次渲染重新创建
  const menuGroups = useMemo(() => {
    const allMenuGroups = Object.values(MENU_CONFIG).map((group) => ({
      title: group.title,
      permission: 'permission' in group ? group.permission : undefined,
      items: group.items
        // 先根据购买模式过滤 creditsOnly 菜单项
        .filter((item) => !('creditsOnly' in item && item.creditsOnly) || isCreditsMode)
        .map((item) => ({
          key: item.key,
          label: 'useTranslation' in item && item.useTranslation ? t(item.labelKey) : item.labelKey,
          description: 'useTranslation' in item && item.useTranslation ? t(item.description) : item.description,
          icon: ICON_MAP[item.iconName],
          permission: 'permission' in item ? item.permission : undefined,
        })),
    }));

    // 根据权限过滤菜单
    return allMenuGroups
      .filter((group) => !group.permission || hasPermission(userRole, group.permission))
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.permission || hasPermission(userRole, item.permission)),
      }))
      .filter((group) => group.items.length > 0);
  }, [userRole, t, isCreditsMode]);

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

  // 生成面包屑 - 现代化设计
  const renderBreadcrumbs = () => {
    if (!currentPath) return null;

    // 查找当前页面对应的菜单项
    const currentMenuItem = menuGroups
      .flatMap((group) => group.items)
      .find((item) => item.key === currentPath);

    return (
      <nav className="flex items-center gap-2 text-sm">
        {/* 控制台首页 */}
        <Link
          href="/dashboard/home"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <Home size={14} />
          <span>控制台</span>
        </Link>

        <ChevronRight size={14} className="text-gray-300" />

        {/* 当前页面 */}
        {currentMenuItem ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-900 font-medium">
            <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 text-gray-500">{currentMenuItem.icon}</span>
            <span>{currentMenuItem.label}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-900 font-medium">
            {currentPath}
          </span>
        )}
      </nav>
    );
  };

  // 获取当前页面的图标和渐变色
  const currentPageInfo = menuGroups.flatMap((group) => group.items).find((item) => item.key === currentPath);

  // 非开发环境下，如果正在加载或未认证，显示加载状态
  // 开发环境下，如果正在加载也显示加载状态（避免菜单闪烁）
  if (status === 'loading') {
    return <LoadingSpinner size="lg" text="加载中..." fullScreen />;
  }

  if (!IS_DEV && status === 'unauthenticated') {
    return <LoadingSpinner size="lg" text="正在跳转到登录页..." fullScreen />;
  }

  return (
    <div className="h-screen bg-[#f8fafc] flex">
      {/* Mobile menu overlay */}
      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      ) : null}

      {/* Sidebar - 固定定位，不随内容滚动 */}
      <aside
        style={{ width: collapsed ? '5rem' : '18rem', minWidth: collapsed ? '5rem' : '18rem', maxWidth: collapsed ? '5rem' : '18rem' }}
        className={`flex-shrink-0 bg-white h-screen flex flex-col transition-all duration-300 ease-in-out z-50 fixed top-0 left-0 border-r border-gray-100 shadow-sm ${mobileMenuOpen ? 'flex' : 'hidden lg:flex'}`}
      >
        {/* Logo - 更精致的设计 */}
        <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between">
          {collapsed ? (
            <Link href="/" className="w-full flex justify-center">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <Image src="/favicon.ico" alt={siteConfig.siteName} width={40} height={40} className="w-full h-full object-contain" />
              </div>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                <Image src="/favicon.ico" alt={siteConfig.siteName} width={40} height={40} className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {siteConfig.siteName}
              </span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${collapsed ? 'hidden' : ''}`}
          >
            <ChevronLeft size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Navigation - 现代化菜单设计，使用自定义滚动条样式防止布局抖动 */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto dashboard-nav-scroll">
          {/* 骨架屏 - 在角色未加载时显示，防止菜单项突然出现 */}
          {!cachedRole ? (
            <div className="space-y-6 animate-pulse">
              {/* 概览组骨架 */}
              <div>
                {!collapsed && <div className="h-3 w-12 bg-gray-200 rounded mb-3 mx-3" />}
                <div className="space-y-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
                      <div className="w-5 h-5 bg-gray-200 rounded" />
                      {!collapsed && <div className="h-4 bg-gray-200 rounded flex-1" />}
                    </div>
                  ))}
                </div>
              </div>
              {/* 管理功能组骨架 */}
              <div>
                {!collapsed && <div className="h-3 w-16 bg-gray-200 rounded mb-3 mx-3" />}
                <div className="space-y-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
                      <div className="w-5 h-5 bg-gray-200 rounded" />
                      {!collapsed && <div className="h-4 bg-gray-200 rounded flex-1" />}
                    </div>
                  ))}
                </div>
              </div>
              {/* AI 工具组骨架 */}
              <div>
                {!collapsed && <div className="h-3 w-14 bg-gray-200 rounded mb-3 mx-3" />}
                <div className="space-y-1">
                  <div className={`flex items-center gap-3 px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-5 h-5 bg-gray-200 rounded" />
                    {!collapsed && <div className="h-4 bg-gray-200 rounded flex-1" />}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 实际菜单内容 */
            menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-6">
                {collapsed ? null : (
                  <div className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
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
                              ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-md shadow-primary/25'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
                            ${collapsed ? 'justify-center' : ''}
                          `}
                        >
                          <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
                            {item.icon}
                          </span>
                          {collapsed ? (
                            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                              {item.label}
                              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                            </div>
                          ) : (
                            <span className="font-medium text-sm">{item.label}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </nav>

        {/* Collapse toggle for collapsed state */}
        {collapsed ? (
          <div className="px-3 py-2 border-t border-gray-100">
            <button
              onClick={() => setCollapsed(false)}
              className="w-full h-10 rounded-xl hover:bg-gray-50 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        ) : null}

        {/* User Profile - 优化设计 */}
        <div className="border-t border-gray-100 p-3 relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 flex-shrink-0">
              {renderAvatar()}
            </div>
            {collapsed ? null : (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium text-gray-900 truncate text-sm">{renderFullName()}</div>
                </div>
                <ChevronUp
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${isMenuOpen ? '' : 'rotate-180'}`}
                />
              </>
            )}
          </button>

          {/* Dropdown Menu - 现代化下拉菜单 */}
          {isMenuOpen ? (
            <div
              className={`absolute ${collapsed ? 'left-20 bottom-4 w-64' : 'bottom-full left-3 right-3'} mb-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden`}
            >
              {/* User Info Header */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-gray-200">
                    {renderAvatar()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{renderFullName()}</div>
                    <div className="text-xs text-gray-400">管理您的账户</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <ul className="p-2">
                {/* Settings Section */}
                <li className="px-2 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  设置
                </li>
                {menuItems.slice(0, 1).map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 text-sm"
                    >
                      <span className="text-gray-400">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                ))}

                {/* Divider */}
                <div className="my-2 border-t border-gray-100" />

                {/* Quick Links Section */}
                <li className="px-2 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  快捷链接
                </li>
                {menuItems.slice(1).map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.target}
                      className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 text-sm"
                    >
                      <span className="text-gray-400">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </a>
                  </li>
                ))}

                {/* Divider */}
                <div className="my-2 border-t border-gray-100" />

                {/* Logout */}
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-rose-50 rounded-lg transition-colors text-rose-500 w-full text-sm"
                  >
                    <LogOut size={16} />
                    <span className="font-medium">退出登录</span>
                  </button>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </aside>

      {/* Main Content - 桌面端添加左边距补偿固定侧边栏 */}
      <div
        className={`flex-1 flex flex-col h-screen min-w-0 transition-[margin] duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}
      >
        {/* Top Navigation Bar - 固定高度，不可压缩 */}
        <header className="h-16 min-h-16 flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Mobile menu toggle */}
            <button
              className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center lg:hidden transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
            </button>

            {/* Breadcrumbs - Desktop */}
            <div className="hidden lg:flex flex-1">
              {renderBreadcrumbs()}
            </div>

            {/* User avatar - Mobile */}
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 lg:hidden">
              {renderAvatar()}
            </div>
          </div>
        </header>

        {/* Content area - 可滚动区域 */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
            {/* Page header - 更精致的标题设计 */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900">
                {currentPageInfo?.label || '控制台'}
              </h1>
              {currentPageInfo?.description && (
                <p className="text-gray-500 text-sm mt-1">{currentPageInfo.description}</p>
              )}
            </div>

            {/* Page content */}
            {children}
          </div>
        </main>

        {/* Footer - 固定高度，不可压缩 */}
        <footer className="flex-shrink-0 py-4 px-6 bg-white border-t border-gray-100 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {siteConfig.siteName}
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;

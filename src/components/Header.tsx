'use client';
import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useMessages } from 'next-intl';
import I18n from './I18n';
import ThemeComponent from './theme/ThemeChoose';

const UserMenu = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await signOut({ redirect: false, callbackUrl: '/' });
    router.push(result.url);
  };

  if (status === 'unauthenticated' || status === 'loading') {
    return null;
  }

  const renderName = () => {
    if (session?.user?.avatar) {
      return (
        <Image
          src={session.user.avatar}
          alt="头像"
          width={32}
          height={32}
          quality={80}
          className="w-full h-full object-cover rounded-full"
        />
      );
    }
    if (session?.user?.email) return session.user.email[0].toUpperCase();
    if (session?.user?.phone) return session.user.phone[0];
    if (session?.user?.wechatOpenId) return session.user.nickName?.[0] ?? '?';
    return '?';
  };

  const renderFullName = () => {
    if (session?.user?.email) return session.user.email;
    if (session?.user?.phone) return session.user.phone;
    if (session?.user?.wechatOpenId) return session.user.nickName;
    return '未知用户';
  };

  return (
    <>
      {/* PC端显示 */}
      <div className="hidden sm:block dropdown dropdown-end">
        <label tabIndex={0} className="cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
            {renderName()}
          </div>
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow-lg bg-white rounded-xl w-48 mt-3 border border-gray-100"
        >
          <li className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 mb-1">
            {renderFullName()}
          </li>
          <li>
            <Link
              href="/dashboard/home"
              className="text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              我的账户
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:bg-red-50 rounded-lg"
            >
              退出登录
            </button>
          </li>
        </ul>
      </div>

      {/* 移动端显示 */}
      <div className="sm:hidden flex items-center gap-2">
        <Link href="/dashboard/home" className="text-sm text-gray-600">
          我的
        </Link>
        <button onClick={handleLogout} className="text-sm text-red-500">
          退出
        </button>
      </div>
    </>
  );
};

export default function Header() {
  const t = useTranslations('Header');
  const messages = useMessages();
  const headerConfig = messages.Header as any;
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              alt={headerConfig.logo.alt}
              src={headerConfig.logo.url}
              width={32}
              height={32}
              quality={90}
              priority
              className="h-8 w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {headerConfig.nav.items.map((item: { name: string; href: string; target?: string; rel?: string }, index: number) => (
              <a
                key={item.name}
                href={item.href}
                target={item.target}
                rel={item.rel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t(`nav.items.${index}.name`)}
              </a>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-1">
            <I18n />
            <ThemeComponent />
            {status === 'authenticated' ? (
              <UserMenu />
            ) : (
              <Link
                href="/auth/signin"
                className="ml-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                {t('login.label')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

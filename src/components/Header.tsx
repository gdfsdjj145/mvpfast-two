'use client';
import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    return <></>;
  }

  const renderName = () => {
    if (session?.user?.avatar) {
      return (
        <img
          src={session.user.avatar}
          alt="头像"
          className="w-full h-full object-cover"
        />
      );
    }
    if (session?.user?.email) return session.user.email[0];
    if (session?.user?.phone) return session.user.phone[0];
    if (session?.user?.wechatOpenId) return session.user.nickName[0];
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
        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center text-base">
              <span>{renderName()}</span>
            </div>
          </div>
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-1 shadow-sm bg-base-100 rounded-box w-52 mt-2 right-0"
        >
          <li className="menu-title text-center font-bold text-sm pb-1 border-b border-gray-200">
            {renderFullName()}
          </li>
          <li className="hover:bg-base-200 rounded-lg">
            <Link
              href="/dashboard/home"
              className="justify-center py-1 text-sm font-medium"
            >
              我的
            </Link>
          </li>
          <li className="hover:bg-base-200 rounded-lg border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="justify-center py-1 text-sm font-medium text-red-500"
            >
              退出
            </button>
          </li>
        </ul>
      </div>

      {/* 移动端显示 */}
      <div className="sm:hidden">
        <Link href="/dashboard/order" className="btn btn-ghost btn-sm mr-2">
          <span className="text-sm font-semibold">我的</span>
        </Link>
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm text-red-500"
        >
          <span className="text-sm font-semibold">退出</span>
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
    <header className="bg-white shadow-xs">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="navbar-start">
          <a href="/" className="normal-case text-xl p-0">
            <img
              alt={headerConfig.logo.alt}
              src={headerConfig.logo.url}
              className="h-10 w-auto"
            />
          </a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            {headerConfig.nav.items.map((item, index) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  target={item.target}
                  rel={item.rel}
                  className="px-3 py-2 text-sm"
                >
                  {t(`nav.items.${index}.name`)}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="navbar-end flex gap-6">
          <I18n />
          <ThemeComponent />
          <UserMenu />
          {status === 'unauthenticated' && (
            <div className="flex items-center gap-4">
              <Link href="/auth/signin" className="btn btn-secondary">
                {t('login.label')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

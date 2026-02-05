'use client';
import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useMessages } from 'next-intl';
import I18n from './I18n';
import ThemeComponent from './theme/ThemeChoose';
import { useSiteConfig } from '@/hooks/useSiteConfig';

const UserMenu = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('Header');

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
          alt={t('userMenu.avatarAlt')}
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
    if (session?.user?.nickName) return session.user.nickName;
    return t('userMenu.unknownUser');
  };

  return (
    <>
      {/* PC端显示 */}
      <div className="hidden sm:block dropdown dropdown-end">
        <label tabIndex={0} className="cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content text-sm font-medium overflow-hidden">
            {renderName()}
          </div>
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-xl w-48 mt-3 border border-base-200"
        >
          <li className="px-3 py-2 text-xs text-base-content/50 border-b border-base-200 mb-1">
            {renderFullName()}
          </li>
          <li>
            <Link
              href="/dashboard/my-orders"
              prefetch={false}
              className="text-sm text-base-content hover:bg-base-200 rounded-lg"
            >
              {t('userMenu.account')}
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="text-sm text-error hover:bg-error/10 rounded-lg"
            >
              {t('userMenu.logout')}
            </button>
          </li>
        </ul>
      </div>

      {/* 移动端显示 */}
      <div className="sm:hidden flex items-center gap-2">
        <Link href="/dashboard/my-orders" prefetch={false} className="text-sm text-base-content/70">
          {t('userMenu.accountMobile')}
        </Link>
        <button onClick={handleLogout} className="text-sm text-error">
          {t('userMenu.logoutMobile')}
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
  const { siteConfig } = useSiteConfig();

  return (
    <header className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              alt={siteConfig.siteName}
              src="/favicon.ico"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-lg font-bold text-base-content">{siteConfig.siteName}</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {headerConfig.nav.items.map((item: { name: string; href: string; target?: string; rel?: string }, index: number) => (
              <a
                key={item.name}
                href={item.href}
                target={item.target}
                rel={item.rel}
                className="px-4 py-2.5 text-sm font-medium text-base-content/60 hover:text-base-content rounded-lg hover:bg-base-200/80 transition-all duration-200 cursor-pointer"
              >
                {t(`nav.items.${index}.name`)}
              </a>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <I18n />
            <ThemeComponent />
            {status === 'authenticated' ? (
              <UserMenu />
            ) : (
              <Link
                href="/auth/signin"
                className="ml-2 btn btn-primary rounded-full px-5 min-h-[40px] h-10"
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

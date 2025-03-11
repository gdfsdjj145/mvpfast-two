'use client';
import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { IoGridOutline } from 'react-icons/io5';
import { useTranslations, useMessages } from 'next-intl';
import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';
import { landingpageConfig } from '@/store/landingpage';

const THEMES = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
];

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
          className="dropdown-content menu p-1 shadow bg-base-100 rounded-box w-52 mt-2 right-0"
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

const I18NComponent = () => {
  const locale = useLocale();

  React.useEffect(() => {
    // 初次加载时，如果没有存储的语言设置，则设置为中文
    const savedLocale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('locale='));
    if (!savedLocale) {
      document.cookie = `locale=zh; path=/; max-age=31536000`; // 保存一年
    }
  }, []);

  const languageList = [
    {
      name: '中文',
      locale: 'zh',
    },
    {
      name: 'English',
      locale: 'en',
    },
  ];

  const switchLanguage = (nextLocale: string) => {
    // 设置 cookie
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000`;
    // 刷新页面以应用新的语言设置
    window.location.reload();
  };

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle">
        <span className="text-base font-medium">
          <Languages />
        </span>
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 mt-2"
      >
        {languageList.map((item) => (
          <li
            key={item.locale}
            className={`${
              locale === item.locale ? 'bg-secondary text-white' : ''
            }`}
          >
            <button
              onClick={() => switchLanguage(item.locale)}
              className="py-2"
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ThemeComponent = () => {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('Header');

  return (
    <div className="tooltip tooltip-bottom hidden lg:block" data-tip="应用设置">
      <div className="drawer drawer-end">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label htmlFor="my-drawer-4" className="drawer-button">
            <IoGridOutline
              className="cursor-pointer transition-all hover:scale-110"
              size={30}
            ></IoGridOutline>
          </label>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="bg-base-200 text-base-content min-h-full w-96 p-4">
            {/* Sidebar content here */}
            <li className="p-4 rounded-xl space-y-4">
              <div className="mb-1">{t('theme.label')}</div>
              <div className="bg-base-100 grid grid-flow-col md: grid-rows-3 md:grid-rows-4 xl:md:grid-rows-5 gap-2 p-1 overflow-y-scroll max-w-xs md:max-w-md lg:max-w-xl xl:max-w-2xl justify-start">
                {THEMES.map((item) => (
                  <div
                    key={item}
                    className="bg-base-200 hover:bg-base-300 duration-100 cursor-pointer rounded-xl p-4 border custom-cursor-on-hover"
                    onClick={() => setTheme(item)}
                  >
                    <div className="rounded-lg relative duration-200 w-20 group drop-shadow-md">
                      <div
                        className="relative z-30 grid h-12 grid-cols-4 rounded-lg overflow-hidden"
                        data-theme={item}
                      >
                        <div className="h-full bg-base-100 rounded-l-lg"></div>
                        <div className="h-full bg-base-200"></div>
                        <div className="h-full bg-base-content"></div>
                        <div className="h-full bg-primary rounded-r-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default function Header() {
  const t = useTranslations('Header');
  const messages = useMessages();
  const headerConfig = messages.Header as any;
  const { status } = useSession();

  return (
    <header className="bg-white shadow-sm">
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
          <I18NComponent />
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

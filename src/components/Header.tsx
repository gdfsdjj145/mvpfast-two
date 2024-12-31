'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { IoGridOutline } from 'react-icons/io5';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

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
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await supabase.auth.signOut();
    console.log(result);
    document.cookie =
      'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie =
      'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
  };

  if (loading) {
    return <></>;
  }

  console.log(user);

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
    if (user?.email) return user.email[0];
    if (user?.phone) return user.phone[0];
    if (user?.wechatOpenId) return user.nickName[0];
    return '?';
  };

  const renderFullName = () => {
    if (user?.email) return user.email;
    if (user?.phone) return user.phone;
    if (user?.wechatOpenId) return user.nickName;
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

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user, loading } = useAuth();
  const navigation = [
    { name: '价格', href: '/#price' },
    { name: '文档', href: '/docs/introduction', target: '_blank' },
    { name: '博客', href: '/blog' },
    {
      name: '关于我们',
      href: 'https://www.islandspage.com/EM-T',
      target: '_blank',
      rel: 'external',
    },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="navbar-start">
          <a href="/" className="normal-case text-xl p-0">
            <img alt="MvpFast" src="/title-logo.png" className="h-10 w-auto" />
          </a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  target={item.target}
                  rel={item.rel}
                  className="px-3 py-2 text-sm"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="navbar-end flex gap-6">
          <div
            className="tooltip tooltip-bottom hidden lg:block"
            data-tip="应用设置"
          >
            <div className="drawer drawer-end">
              <input
                id="my-drawer-4"
                type="checkbox"
                className="drawer-toggle"
              />
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
                    <div className="mb-1">主题色</div>
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
          {user ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/signin" className="btn btn-secondary">
                登录
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

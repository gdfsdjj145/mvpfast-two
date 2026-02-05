'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Forbidden() {
  const params = useParams();
  const locale = (params?.local as string) || 'en';
  const isZh = locale === 'zh';

  const content = {
    zh: {
      title: '访问被拒绝',
      description: '抱歉，您没有权限访问此页面。此页面仅限管理员访问。',
      homeButton: '返回首页',
      dashboardButton: '返回控制台',
    },
    en: {
      title: 'Access Denied',
      description:
        'Sorry, you do not have permission to access this page. This page is restricted to administrators only.',
      homeButton: 'Go Back Home',
      dashboardButton: 'Go to Dashboard',
    },
  };

  const t = isZh ? content.zh : content.en;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-300 to-base-200 p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* 403 Number with gradient and animation */}
        <div className="relative mb-8">
          <h1 className="text-[12rem] md:text-[16rem] font-bold leading-none">
            <span className="bg-gradient-to-r from-error via-warning to-error bg-clip-text text-transparent animate-pulse">
              403
            </span>
          </h1>
          <div className="absolute inset-0 blur-3xl opacity-30">
            <span className="text-[12rem] md:text-[16rem] font-bold leading-none bg-gradient-to-r from-error via-warning to-error bg-clip-text text-transparent">
              403
            </span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-base-100/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-base-300">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-error to-warning bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-base md:text-lg text-base-content/70 mb-8 max-w-md mx-auto">
            {t.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`/${locale}`}
              className="btn btn-primary btn-lg gap-2 min-w-[180px] shadow-lg hover:shadow-xl transition-shadow"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              {t.homeButton}
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="btn btn-ghost btn-lg gap-2 min-w-[180px]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              {t.dashboardButton}
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center gap-2">
          <div
            className="w-2 h-2 rounded-full bg-error animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-2 h-2 rounded-full bg-warning animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-2 h-2 rounded-full bg-error animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
}

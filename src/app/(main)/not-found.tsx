'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-300 to-base-200 p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Number with gradient and animation */}
        <div className="relative mb-8">
          <h1 className="text-[12rem] md:text-[16rem] font-bold leading-none">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
              404
            </span>
          </h1>
          <div className="absolute inset-0 blur-3xl opacity-30">
            <span className="text-[12rem] md:text-[16rem] font-bold leading-none bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              404
            </span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-base-100/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-base-300">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Page Not Found
          </h2>
          <p className="text-base md:text-lg text-base-content/70 mb-2">
            页面未找到
          </p>
          <p className="text-sm text-base-content/60 mb-8 max-w-md mx-auto">
            The page you are looking for does not exist or has been removed.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="btn btn-primary btn-lg gap-2 min-w-[160px] shadow-lg hover:shadow-xl transition-shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Go Back Home / 返回首页
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn btn-ghost btn-lg gap-2 min-w-[160px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Go Back / 返回上页
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 可以在这里添加错误日志上报
    console.error('Page Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center p-8 bg-base-100 rounded-lg shadow-lg max-w-md">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold mb-4">出错了</h1>
        <p className="text-base-content/70 mb-6">
          抱歉，页面加载时发生了错误。请尝试刷新页面或返回首页。
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-error/10 rounded-lg text-left">
            <p className="text-sm font-mono text-error break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-base-content/50 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="btn btn-primary"
          >
            重试
          </button>
          <a href="/" className="btn btn-outline">
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}

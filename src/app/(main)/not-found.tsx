import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center p-8 bg-base-100 rounded-lg shadow-lg max-w-md">
        <div className="text-8xl font-bold text-primary mb-4">404</div>
        <h1 className="text-2xl font-bold mb-4">页面未找到</h1>
        <p className="text-base-content/70 mb-6">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn btn-primary">
            返回首页
          </Link>
          <Link href="/dashboard/home" className="btn btn-outline">
            进入控制台
          </Link>
        </div>
      </div>
    </div>
  );
}

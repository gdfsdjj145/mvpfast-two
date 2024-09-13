'use client';
import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { allDocPages } from 'contentlayer/generated';
import { FaBook, FaBars, FaChevronDown } from 'react-icons/fa';

interface DocGroup {
  [key: string]: typeof allDocPages;
}

// 文件夹名称映射
const folderNames: { [key: string]: string } = {
  start: '开发教程',
  dev: '开始',
  // 添加更多文件夹映射...
};

// 自定义 hook 用于处理加载状态
const useLoading = (pathname: string) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const isClientRef = useRef(false);

  useLayoutEffect(() => {
    isClientRef.current = true;
  }, []);

  useEffect(() => {
    if (isClientRef.current) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return isLoading;
};

// 导航栏组件
const Sidebar = React.memo(({ selectedDocUrl }: { selectedDocUrl: string }) => {
  // 按文件夹分组文档
  const groupedDocs = useMemo(() => {
    const groups = allDocPages.reduce((acc: DocGroup, doc) => {
      const folder = doc.folder || 'root';
      if (!acc[folder]) {
        acc[folder] = [];
      }
      acc[folder].push(doc);
      return acc;
    }, {});

    // 对每个分组内的文档按 order 排序
    Object.keys(groups).forEach((folder) => {
      groups[folder].sort((a, b) => a.order - b.order);
    });

    return groups;
  }, []);

  const renderDocLink = useCallback(
    (doc: any) => (
      <li key={doc._id}>
        <Link
          href={doc.url}
          prefetch
          className={`flex items-center p-2 hover:bg-base-300 rounded-lg transition-colors duration-200 ${
            selectedDocUrl === doc.url
              ? 'bg-[#e300dd] font-medium text-white'
              : 'text-base-content'
          }`}
        >
          {doc.title}
        </Link>
      </li>
    ),
    [selectedDocUrl]
  );

  return (
    <aside className="bg-base-200 w-80 h-full overflow-y-auto">
      <a
        href="/"
        className="sticky top-0 z-30 bg-opacity-90 backdrop-blur px-4 py-2 bg-base-200 flex items-center gap-2"
      >
        <img src="/title-logo.png" alt="" />
      </a>
      <ul className="menu menu-compact flex flex-col p-4 space-y-2">
        {Object.entries(groupedDocs).map(([folder, docs]) => (
          <li key={folder}>
            <div className="flex items-center justify-between p-2 font-medium">
              <span className="font-bold">{folderNames[folder] || folder}</span>
              <FaChevronDown />
            </div>
            <ul className="ml-4">{docs.map(renderDocLink)}</ul>
          </li>
        ))}
      </ul>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

const DocLayout = React.memo(({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isLoading = useLoading(pathname);

  const selectedDocUrl = useMemo(() => {
    return allDocPages.find((doc) => doc.url === pathname)?.url || '';
  }, [pathname]);

  const renderContent = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }
    return (
      <div className="transition-opacity duration-300 ease-in-out">
        {children}
      </div>
    );
  }, [isLoading, children]);

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        <div className="w-full navbar bg-base-300 lg:hidden">
          <div className="flex-none">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
              <FaBars className="inline-block w-6 h-6 stroke-current" />
            </label>
          </div>
          <div className="flex-1 px-2 mx-2">
            <span className="text-lg font-bold">文档</span>
          </div>
        </div>
        <div className="p-4 w-full">{renderContent()}</div>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        <Sidebar selectedDocUrl={selectedDocUrl} />
      </div>
    </div>
  );
});

DocLayout.displayName = 'DocLayout';

export default DocLayout;

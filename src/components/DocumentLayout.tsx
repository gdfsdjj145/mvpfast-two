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
import { FaBars } from 'react-icons/fa';
import { BsCaretRightSquare } from 'react-icons/bs';
import { BsGrid1X2Fill } from 'react-icons/bs';
import { FiBookOpen } from 'react-icons/fi';

interface DocGroup {
  [key: string]: typeof allDocPages;
}

// 文件夹名称映射
const folderNames: { [key: string]: any } = {
  dev: {
    label: '开始',
    icon: <BsCaretRightSquare />,
    order: 1,
  },
  start: {
    label: '功能',
    icon: <FiBookOpen />,
    order: 2,
  },
  components: {
    label: '组件',
    icon: <BsGrid1X2Fill />,
    order: 3,
  },
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

    // 返回按文件夹顺序排序的文档
    return Object.fromEntries(
      Object.entries(groups).sort(([folderA], [folderB]) => {
        const orderA = folderNames[folderA]?.order || 999;
        const orderB = folderNames[folderB]?.order || 999;
        return orderA - orderB;
      })
    );
  }, []);

  const renderDocLink = useCallback(
    (doc: any) => (
      <li key={doc._id}>
        <Link
          href={doc.url}
          prefetch
          className={`flex items-center p-2 hover:text-secondary rounded-lg transition-colors duration-200 ${
            selectedDocUrl === doc.url
              ? 'bg-primary font-bold text-secondary/50'
              : 'font-medium'
          }`}
        >
          {doc.title}
        </Link>
      </li>
    ),
    [selectedDocUrl]
  );

  return (
    <aside className="h-full overflow-y-auto sm:w-64 bg-[#fcfcfc] border-r-2 border-[#eae9f1]">
      <a
        href="/"
        className="sticky top-0 z-30 bg-base-100 bg-opacity-90 backdrop-blur px-4 py-2 flex items-center gap-2"
      >
        <img
          src="/title-logo.png"
          className="w-32 hover:bg-base-200 pl-2 rounded-lg"
          alt=""
        />
      </a>
      <ul className="menu menu-compact flex flex-col p-4 space-y-2">
        {Object.entries(groupedDocs).map(([folder, docs]) => (
          <li key={folder}>
            <div className="flex items-center justify-between p-2 gap-2 font-medium">
              {folderNames[folder].icon}
              <span className="font-bold flex-1">
                {folderNames[folder].label || folder}
              </span>
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

  // 在内容加载后更新标题
  useEffect(() => {
    const doc = allDocPages.find((doc) => doc.url === selectedDocUrl);
    if (doc) {
      document.title = `${doc.title} | MvpFast-快速构建网站应用`; // 更新网页标题
    }
  }, [selectedDocUrl]);

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
      <div className="drawer-content flex flex-col items-center">
        <div className="w-full navbar bg-base-100 shadow-md lg:hidden">
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
        <div className="bg-base-100 h-full">
          <Sidebar selectedDocUrl={selectedDocUrl} />
        </div>
      </div>
    </div>
  );
});

DocLayout.displayName = 'DocLayout';

export default DocLayout;

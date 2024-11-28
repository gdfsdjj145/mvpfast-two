'use client';
import React, { useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { allDocPages } from 'contentlayer/generated';
import { FaBars } from 'react-icons/fa';
import { BsGrid1X2Fill } from 'react-icons/bs';
import { FiBookOpen } from 'react-icons/fi';
import { VscDebugStart } from 'react-icons/vsc';
import { FaBookTanakh } from 'react-icons/fa6';

interface DocGroup {
  [key: string]: typeof allDocPages;
}

// 文件夹名称映射
const folderNames: { [key: string]: any } = {
  dev: {
    label: '教程',
    icon: <FaBookTanakh />,
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
  articles: {
    introduction: <VscDebugStart />,
  },
};

// 导航栏组件
const Sidebar = React.memo(({ selectedDocUrl }: { selectedDocUrl: string }) => {
  // 修改文档分组逻辑
  const { groupedDocs, ungroupedDocs } = useMemo(() => {
    const grouped: DocGroup = {};
    const ungrouped: typeof allDocPages = [];

    allDocPages.forEach((doc) => {
      if (doc.folder && doc.folder !== 'root') {
        if (!grouped[doc.folder]) {
          grouped[doc.folder] = [];
        }
        grouped[doc.folder].push(doc);
      } else {
        ungrouped.push(doc);
      }
    });

    // 对每个分组内的文档按 order 排序
    Object.keys(grouped).forEach((folder) => {
      grouped[folder].sort((a, b) => a.order - b.order);
    });

    // 对未分组文档排序
    ungrouped.sort((a, b) => a.order - b.order);

    // 返回按文件夹顺序排序的文档
    const sortedGroups = Object.fromEntries(
      Object.entries(grouped).sort(([folderA], [folderB]) => {
        const orderA = folderNames[folderA]?.order || 999;
        const orderB = folderNames[folderB]?.order || 999;
        return orderA - orderB;
      })
    );

    return { groupedDocs: sortedGroups, ungroupedDocs: ungrouped };
  }, []);

  const renderDocLink = useCallback(
    (doc: any) => {
      const urlParts = doc.url.split('/');
      const key = urlParts[urlParts.length - 1];
      const isSelected = selectedDocUrl === doc.url;

      return (
        <li key={doc._id}>
          <Link
            href={doc.url}
            prefetch
            className={`flex items-center p-2 hover:text-secondary rounded-lg transition-colors duration-200 text-base ${
              isSelected
                ? 'bg-primary font-bold text-secondary/50'
                : 'font-medium'
            }`}
          >
            {folderNames.articles[key] && (
              <span
                className={`mr-2 transition-transform duration-200 ${
                  isSelected ? 'scale-125' : 'scale-100'
                }`}
              >
                {folderNames.articles[key]}
              </span>
            )}
            {doc.title}
          </Link>
        </li>
      );
    },
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
        {/* 先渲染未分组的文档 */}
        {ungroupedDocs.map(renderDocLink)}

        {/* 然后渲染分组的文档 */}
        {Object.entries(groupedDocs).map(([folder, docs]) => (
          <li key={folder}>
            <div className="flex items-center justify-between p-2 gap-3">
              <span className="text-xl"> {folderNames[folder]?.icon}</span>
              <span className="flex-1 text-base">
                {folderNames[folder]?.label || folder}
              </span>
            </div>
            <ul className="ml-4 text-sm">{docs.map(renderDocLink)}</ul>
          </li>
        ))}
      </ul>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

const DocLayout = React.memo(({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const selectedDocUrl = useMemo(() => {
    return allDocPages.find((doc) => doc.url === pathname)?.url || '';
  }, [pathname]);

  // 在内容加载后更新标题
  useEffect(() => {
    const doc = allDocPages.find((doc) => doc.url === selectedDocUrl);
    if (doc) {
      document.title = `${doc.title} | MvpFast-快速构建网站应用`;
    }
  }, [selectedDocUrl]);

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
        <div className="p-4 w-full">
          <div className="transition-opacity duration-300 ease-in-out">
            {children}
          </div>
        </div>
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

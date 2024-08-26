import React from 'react';
import Link from 'next/link';
import { allDocPages } from 'contentlayer/generated';

const DocLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 左侧导航栏 */}
      <nav style={{ width: '250px', backgroundColor: '#f4f4f4' }}>
        <img className="px-2 ml-2" src="/title-logo.png" alt="" />
        <ul className="p-5">
          {allDocPages.map((doc) => (
            <li key={doc._id}>
              <Link href={doc.url}>{doc.title}</Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 右侧内容区域 */}
      <main style={{ flexGrow: 1, padding: '20px' }}>{children}</main>
    </div>
  );
};

export default DocLayout;

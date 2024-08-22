import React from 'react';
import Link from 'next/link';
import { allDocPages } from 'contentlayer/generated';

const DocLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 左侧导航栏 */}
      <nav
        style={{ width: '250px', padding: '20px', backgroundColor: '#f4f4f4' }}
      >
        <ul>
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

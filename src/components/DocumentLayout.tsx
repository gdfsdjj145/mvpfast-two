'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { allDocPages } from 'contentlayer/generated';
import { FaBook, FaBars, FaTimes, FaChevronRight } from 'react-icons/fa';

const DocLayout = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="my-drawer-2"
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        onChange={() => setIsOpen(!isOpen)}
      />
      <div className="drawer-content flex flex-col">
        <div className="sticky top-0 z-30 flex h-16 w-full justify-center bg-opacity-90 backdrop-blur transition-all duration-100 bg-base-100 text-base-content shadow-sm">
          <nav className="navbar w-full">
            <div className="flex-none lg:hidden">
              <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                <FaBars className="inline-block w-6 h-6 stroke-current" />
              </label>
            </div>
            <div className="flex-1 px-2 mx-2 text-2xl font-bold">
              MVPFast 文档
            </div>
          </nav>
        </div>
        <main className="flex-grow p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        <aside className="bg-base-200 w-80 h-full overflow-y-auto">
          <a
            href="/"
            className="z-20 bg-base-200 bg-opacity-90 backdrop-blur sticky top-0 items-center gap-2 px-4 py-2 hidden lg:flex shadow-sm"
          >
            <img src="/title-logo.png" alt="" />
          </a>
          <div className="h-4"></div>
          <ul className="menu menu-compact flex flex-col p-4 space-y-2">
            {isClient &&
              allDocPages.map((doc) => (
                <li key={doc._id}>
                  <Link
                    href={doc.url}
                    className={`flex items-center p-3 hover:bg-base-300 rounded-lg transition-colors duration-200 ${
                      pathname === doc.url
                        ? 'bg-primary text-primary-content font-medium'
                        : 'text-base-content'
                    }`}
                  >
                    <FaChevronRight
                      className={`mr-2 ${
                        pathname === doc.url
                          ? 'text-primary-content'
                          : 'text-primary'
                      }`}
                    />
                    {doc.title}
                  </Link>
                </li>
              ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default DocLayout;

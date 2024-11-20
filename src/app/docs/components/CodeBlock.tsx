'use client';

import React from 'react';

export const CodeBlock = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => {
  const lines = children.trim().split('\n');

  return (
    <div className="relative my-6 rounded-lg overflow-hidden bg-[#1e1e1e] group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => navigator.clipboard.writeText(children)}
          className="p-2 text-gray-400 hover:text-white rounded"
          title="Copy code"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
      <div className="flex">
        <div className="hidden text-gray-500 bg-[#252525] pr-4 py-4 text-right select-none md:block">
          {lines.map((_, i) => (
            <div key={i + 1} className="px-4 text-sm">
              {i + 1}
            </div>
          ))}
        </div>
        <pre className="overflow-x-auto w-full p-4 text-sm">
          <code className={className}>{children}</code>
        </pre>
      </div>
    </div>
  );
};

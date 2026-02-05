'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

/**
 * 通用 Loading 组件
 * @param size 大小: xs, sm, md, lg
 * @param text 加载文字
 * @param className 额外的 CSS 类名
 * @param fullScreen 是否全屏居中显示
 */
export default function LoadingSpinner({
  size = 'md',
  text,
  className = '',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <span className={`loading loading-spinner loading-${size} text-primary`}></span>
  );

  if (fullScreen) {
    return (
      <div className={`min-h-screen bg-base-100 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-4">
          {spinner}
          {text ? <p className="text-base-content/60">{text}</p> : null}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {spinner}
        <p className="text-base-content/60 text-sm">{text}</p>
      </div>
    );
  }

  return spinner;
}

/**
 * 表格行加载状态
 */
export function TableLoadingRow({ colSpan = 5 }: { colSpan?: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-8">
        <LoadingSpinner size="md" />
      </td>
    </tr>
  );
}

/**
 * 表格空数据状态
 */
export function TableEmptyRow({
  colSpan = 5,
  text = '暂无数据',
}: {
  colSpan?: number;
  text?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-8 text-base-content/60">
        {text}
      </td>
    </tr>
  );
}

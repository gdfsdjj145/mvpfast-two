'use client';

import { useEffect, useRef } from 'react';
import Clipboard from 'clipboard';

interface ClipboardCopyButtonProps {
  children: React.ReactNode;
  cb: () => void;
  text: string;
}

const ClipboardCopyButton = ({
  children,
  cb,
  text,
}: ClipboardCopyButtonProps) => {
  const clipboardRef = useRef<Clipboard | null>(null);

  useEffect(() => {
    // 创建 Clipboard 实例
    clipboardRef.current = new Clipboard('.copy-button', {
      text: () => text,
    });

    // 绑定事件监听
    clipboardRef.current.on('success', () => {
      cb();
    });

    clipboardRef.current.on('error', (e) => {
      console.error('Failed to copy:', e);
    });

    // 清理函数
    return () => {
      if (clipboardRef.current) {
        clipboardRef.current.destroy();
      }
    };
  }, [text, cb]);

  return <div className="copy-button">{children}</div>;
};

export default ClipboardCopyButton;

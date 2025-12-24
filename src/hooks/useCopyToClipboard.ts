'use client';

import { useState, useCallback } from 'react';

/**
 * 复制状态
 */
export type CopyStatus = 'idle' | 'copied' | 'error';

/**
 * useCopyToClipboard 返回值
 */
export interface UseCopyToClipboardReturn {
  /** 复制的值 */
  copiedValue: string | null;
  /** 复制状态 */
  status: CopyStatus;
  /** 是否已复制 */
  isCopied: boolean;
  /** 是否出错 */
  isError: boolean;
  /** 复制函数 */
  copy: (text: string) => Promise<boolean>;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 复制到剪贴板 Hook
 *
 * @param resetDelay - 自动重置延迟 (毫秒)，设为 0 则不自动重置
 * @returns 复制状态和方法
 *
 * @example
 * ```tsx
 * function CopyButton({ text }: { text: string }) {
 *   const { copy, isCopied, isError } = useCopyToClipboard(2000);
 *
 *   return (
 *     <button onClick={() => copy(text)}>
 *       {isCopied ? '已复制!' : isError ? '复制失败' : '复制'}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 带回调的使用方式
 * function ShareLink({ url }: { url: string }) {
 *   const { copy, isCopied } = useCopyToClipboard();
 *
 *   const handleCopy = async () => {
 *     const success = await copy(url);
 *     if (success) {
 *       toast.success('链接已复制');
 *     } else {
 *       toast.error('复制失败，请手动复制');
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input value={url} readOnly />
 *       <button onClick={handleCopy}>
 *         {isCopied ? '✓' : '复制'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCopyToClipboard(resetDelay: number = 2000): UseCopyToClipboardReturn {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [status, setStatus] = useState<CopyStatus>('idle');

  const reset = useCallback(() => {
    setCopiedValue(null);
    setStatus('idle');
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // 检查是否支持剪贴板 API
      if (!navigator?.clipboard) {
        console.warn('剪贴板 API 不可用');

        // 降级方案：使用 execCommand
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          textArea.style.top = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const success = document.execCommand('copy');
          document.body.removeChild(textArea);

          if (success) {
            setCopiedValue(text);
            setStatus('copied');

            if (resetDelay > 0) {
              setTimeout(reset, resetDelay);
            }
            return true;
          }

          throw new Error('execCommand 复制失败');
        } catch (error) {
          console.error('复制失败:', error);
          setStatus('error');
          setCopiedValue(null);

          if (resetDelay > 0) {
            setTimeout(reset, resetDelay);
          }
          return false;
        }
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopiedValue(text);
        setStatus('copied');

        if (resetDelay > 0) {
          setTimeout(reset, resetDelay);
        }

        return true;
      } catch (error) {
        console.error('复制到剪贴板失败:', error);
        setStatus('error');
        setCopiedValue(null);

        if (resetDelay > 0) {
          setTimeout(reset, resetDelay);
        }

        return false;
      }
    },
    [reset, resetDelay]
  );

  return {
    copiedValue,
    status,
    isCopied: status === 'copied',
    isError: status === 'error',
    copy,
    reset,
  };
}

/**
 * 从剪贴板读取内容 Hook
 *
 * @returns 读取方法和状态
 *
 * @example
 * ```tsx
 * function PasteButton() {
 *   const { paste, pastedValue, isPasted } = useReadClipboard();
 *
 *   return (
 *     <div>
 *       <button onClick={paste}>粘贴</button>
 *       {isPasted && <p>粘贴内容: {pastedValue}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useReadClipboard(): {
  pastedValue: string | null;
  isPasted: boolean;
  isError: boolean;
  paste: () => Promise<string | null>;
  reset: () => void;
} {
  const [pastedValue, setPastedValue] = useState<string | null>(null);
  const [status, setStatus] = useState<CopyStatus>('idle');

  const reset = useCallback(() => {
    setPastedValue(null);
    setStatus('idle');
  }, []);

  const paste = useCallback(async (): Promise<string | null> => {
    if (!navigator?.clipboard) {
      console.warn('剪贴板 API 不可用');
      setStatus('error');
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      setPastedValue(text);
      setStatus('copied');
      return text;
    } catch (error) {
      console.error('读取剪贴板失败:', error);
      setStatus('error');
      return null;
    }
  }, []);

  return {
    pastedValue,
    isPasted: status === 'copied',
    isError: status === 'error',
    paste,
    reset,
  };
}

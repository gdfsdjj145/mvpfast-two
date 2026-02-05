/**
 * 通用工具函数
 *
 * @module @/lib/utils/common
 */

/**
 * 合并 CSS 类名
 * @param classes 类名列表，支持条件类名
 * @example cn('base', isActive && 'active', !isDisabled && 'enabled')
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const renderText = (name: string) => {
  return (name && name.slice(0, 1)) || '';
};

export const isWeixinBrowser = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') !== -1;
};


/**
 * 格式化日期为本地化字符串（仅日期）
 * @param date 要格式化的日期
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date): string {
  try {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '无效日期';
  }
}

/**
 * 格式化日期时间为本地化字符串（包含时间）
 * @param dateStr 日期字符串或 Date 对象
 * @param options 格式化选项
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(
  dateStr: string | Date,
  options: {
    includeYear?: boolean;
    includeSeconds?: boolean;
  } = {}
): string {
  const { includeYear = true, includeSeconds = false } = options;
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleString('zh-CN', {
      year: includeYear ? 'numeric' : undefined,
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
    });
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '无效日期';
  }
}

/**
 * 格式化日期时间（短格式，不含年份）
 * @param dateStr 日期字符串或 Date 对象
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTimeShort(dateStr: string | Date): string {
  return formatDateTime(dateStr, { includeYear: false });
}

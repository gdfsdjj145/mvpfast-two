export function cn(...classes: any) {
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
 * 格式化日期为本地化字符串
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

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

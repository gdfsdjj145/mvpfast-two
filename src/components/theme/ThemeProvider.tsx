'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

export function ThemeProviders({ children, ...props }: ThemeProviderProps) {
   // @ts-ignore - 禁用类型检查以解决Vercel部署问题
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

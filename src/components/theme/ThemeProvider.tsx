'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProviders({ children, ...props }: ThemeProviderProps) {
   // @ts-ignore - 禁用类型检查以解决Vercel部署问题
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

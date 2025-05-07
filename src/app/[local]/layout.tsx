import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from '@/lib/utils';
import '../globals.css';
import { ReduxProvider } from '@/store';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProviders } from '@/components/theme/ThemeProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';

const inter = Inter({ subsets: ['latin'] });

const fonts = localFont({
  src: [
    {
      path: '../../../public/fonts/xft.ttf',
    },
  ],
  variable: '--font-xft',
});

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations('Metadata');
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    icons: {
      icon: [
        { url: '/favicons/icon_16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicons/icon_32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicons/icon_48x48.png', sizes: '48x48', type: 'image/png' },
        { url: '/favicons/icon_64x64.png', sizes: '64x64', type: 'image/png' },
      ],
      apple: [
        { url: '/favicons/icon_128x128.png', sizes: '128x128', type: 'image/png' },
        { url: '/favicons/icon_256x256.png', sizes: '256x256', type: 'image/png' },
      ],
      other: [
        { url: '/favicons/icon_512x512.png', sizes: '512x512', type: 'image/png' },
        { url: '/favicons/icon_1024x1024.png', sizes: '1024x1024', type: 'image/png' },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang="zh">
      <body className={cn(fonts.variable, inter.className)}>
        <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProviders attribute="data-theme" defaultTheme="light">
              <SessionProvider>
                <ReduxProvider>{children}</ReduxProvider>
            </SessionProvider>
            </ThemeProviders>
        </NextIntlClientProvider>
        <Toaster></Toaster>
        <Analytics></Analytics>
        <SpeedInsights></SpeedInsights>
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=G-B315FBSZWP`}
        />
        <Script id="ga-script" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-B315FBSZWP');
          `}
        </Script>
      </body>
    </html>
  );
}

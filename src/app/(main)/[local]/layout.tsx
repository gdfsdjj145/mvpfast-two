import type { Metadata } from 'next';
import { getTranslations, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

/**
 * [local] 子布局
 * 提供语言相关的 metadata 配置
 * html/body 标签在 (main)/layout.tsx 中定义
 */

/**
 * 获取网站基础 URL
 */
function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://example.com';
}

export async function generateMetadata(props: { params: Promise<{ local: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { local: locale } = params;
  const t = await getTranslations('Metadata');
  const siteUrl = getSiteUrl();

  const title = t('title');
  const description = t('description');
  const keywords = t('keywords');

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords,

    // Open Graph - 根据语言设置 locale
    openGraph: {
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },

    // 语言替代版本
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'zh-CN': `${siteUrl}/zh`,
        'en-US': `${siteUrl}/en`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ local: string }>;
}>) {
  const { local: locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

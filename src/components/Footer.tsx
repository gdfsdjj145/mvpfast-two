'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useMessages } from 'next-intl';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function FooterComponent() {
  const t = useTranslations('Footer');
  const messages = useMessages();
  const footerConfig = messages.Footer as any;
  const { siteConfig } = useSiteConfig();

  return (
    <footer className="bg-neutral text-neutral-content">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <Image
                className="w-7 h-7"
                src="/favicon.ico"
                alt={siteConfig.siteName}
                width={28}
                height={28}
              />
              <span className="font-bold text-neutral-content text-lg">{siteConfig.siteName}</span>
            </Link>
            <p className="text-sm text-neutral-content/60 leading-relaxed mb-6">
              {t('subtitle')}
            </p>

            <Link
              href="https://www.mvpfast.top"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-content/5 border border-neutral-content/10 rounded-lg text-sm text-neutral-content/70 hover:bg-neutral-content/10 hover:border-neutral-content/20 transition-all"
            >
              <Image
                className="w-5 h-5"
                src="/favicon.ico"
                alt={siteConfig.siteName}
                width={20}
                height={20}
              />
              <span>{t('poweredBy', { name: siteConfig.siteName })}</span>
            </Link>
          </div>

          {/* Link Columns */}
          {footerConfig.items.map((section: { title: string; links: { name: string; href: string; logo?: string }[] }, index: number) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-neutral-content mb-4">
                {t(`items.${index}.title`)}
              </h3>
              <ul role="list" className="space-y-3">
                {section.links.map((link: { name: string; href: string; logo?: string }, i: number) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-content/60 hover:text-neutral-content transition-all duration-200 flex items-center gap-2 cursor-pointer"
                    >
                      {link.logo && (
                        <Image
                          src={`/${link.logo}`}
                          alt={link.name}
                          width={16}
                          height={16}
                          className="w-4 h-4 opacity-60"
                        />
                      )}
                      {t(`items.${index}.links.${i}.name`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-content/10 flex justify-center items-center">
          <p className="text-xs text-center leading-5 text-neutral-content/50">
            &copy; {footerConfig.beian?.year || new Date().getFullYear()} {siteConfig.siteName},{' '}
            {footerConfig.beian?.text && (
              <a
                href={footerConfig.beian.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-content/70 transition-colors"
              >
                {t('beian.text')}
              </a>
            )}
            {footerConfig.beian?.company && (
              <>
                <br />
                <span>版权所有 {t('beian.company')}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}

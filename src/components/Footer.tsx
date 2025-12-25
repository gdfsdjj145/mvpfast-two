import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useMessages } from 'next-intl';

export default function FooterComponent() {
  const t = useTranslations('Footer');
  const messages = useMessages();
  const footerConfig = messages.Footer as any;

  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <Image
                width={28}
                height={28}
                quality={80}
                loading="lazy"
                className="w-7 h-7"
                src="/brand/logo.png"
                alt="MvpFast Logo"
              />
              <span className="font-bold text-white text-lg">{t('title')}</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {t('subtitle')}
            </p>

            <Link
              href="https://www.mvpfast.top"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <Image
                width={20}
                height={20}
                quality={80}
                loading="lazy"
                className="w-5 h-5"
                src="/brand/logo.png"
                alt="MvpFast Logo"
              />
              <span>使用 MvpFast 开发</span>
            </Link>
          </div>

          {/* Link Columns */}
          {footerConfig.items.map((section: { title: string; links: { name: string; href: string; logo?: string }[] }, index: number) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-4">
                {t(`items.${index}.title`)}
              </h3>
              <ul role="list" className="space-y-3">
                {section.links.map((link: { name: string; href: string; logo?: string }, i: number) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                      {link.logo && (
                        <Image
                          width={16}
                          height={16}
                          quality={80}
                          loading="lazy"
                          src={`/${link.logo}`}
                          alt={link.name}
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
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} MvpFast. All rights reserved.
          </p>
          <a
            href="https://beian.miit.gov.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
          >
            粤ICP备2024286477号-2
          </a>
        </div>
      </div>
    </footer>
  );
}

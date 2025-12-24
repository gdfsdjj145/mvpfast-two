import Image from 'next/image';
import Link from 'next/link';
import { landingpageConfig } from '@/store/landingpage';
import { useTranslations, useMessages } from 'next-intl';
const { footer: footerConfig } = landingpageConfig;

export default function FooterComponent() {
  const t = useTranslations('Footer');
  const messages = useMessages();
  const footerConfig = messages.Footer as any;
  return (
    <footer className="bg-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          <div className="flex  flex-col mr-4 justify-start">
            <Link href="/" className="flex gap-3">
              <Image
                width={24}
                height={24}
                quality={80}
                loading="lazy"
                className="w-6 h-6"
                src="/logo.png"
                alt="MvpFast Logo"
              />
              <span className="font-bold">{t('title')}</span>
            </Link>
            <p className="mt-3 mb-3 text-sm text-base-content/80 leading-relaxed">
              {t('subtitle')}
            </p>

            <Link
              href="https://www.mvpfast.top"
              className="border-2 border-base-content/20 rounded-md p-2 group hover:bg-base-content/20 text-sm flex flex-col items-center"
            >
              <div className="flex gap-2 items-center group justify-center">
                <span className="hidden md:block">使用</span>
                <span className="font-bold flex gap-0.5 items-center tracking-tight">
                  <Image
                    width={24}
                    height={24}
                    quality={80}
                    loading="lazy"
                    className="w-6 h-6 group-hover:scale-110 group-hover:rotate-45 transition-all mr-1"
                    src="/logo.png"
                    alt="MvpFast Logo"
                  />
                  MvpFast
                </span>
                <span>开发</span>
              </div>
              <span className="text-xs text-gray-500 mt-1 block md:hidden">
                点击这里了解更多
              </span>
            </Link>
          </div>
          {footerConfig.items.map((section: { title: string; links: { name: string; href: string; logo?: string }[] }, index: number) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900">
                {t(`items.${index}.title`)}
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                {section.links.map((link: { name: string; href: string; logo?: string }, i: number) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-4"
                    >
                      {link.logo && (
                        <Image
                          width={24}
                          height={24}
                          quality={80}
                          loading="lazy"
                          src={`/${link.logo}`}
                          alt={link.name}
                          className="w-6 h-6"
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
        <div className="mt-10 border-t border-gray-900/10 pt-8 flex justify-center items-center">
          <p className="text-xs leading-5 text-gray-500">
            &copy; 2024 MvpFast,{' '}
            <a href="https://beian.miit.gov.cn" target="_blank">
              粤ICP备2024286477号-2
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

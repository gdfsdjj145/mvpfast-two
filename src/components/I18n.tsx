'use client';

import { useLocale } from 'next-intl';
import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';

const languageList = [
  {
    name: '中文',
    locale: 'zh',
    flag: '🇨🇳',
  },
  {
    name: 'English',
    locale: 'en',
    flag: '🇺🇸',
  },
];

export default function I18NComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const currentLanguage = languageList.find((l) => l.locale === locale) || languageList[0];

  const updateMenuPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const toggleMenu = () => {
    if (!isOpen) {
      updateMenuPosition();
    }
    setIsOpen(!isOpen);
  };

  const switchLanguage = (value: string) => {
    if (value !== locale) {
      let newPathName = pathname.replace(`/${locale}`, `/${value}`);
      if (!newPathName.startsWith(`/${value}`)) {
        newPathName = `/${value}${newPathName}`;
      }
      router.push(newPathName);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="flex items-center justify-center gap-1.5 w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="切换语言"
      >
        <span className="text-base leading-none">{currentLanguage.flag}</span>
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsOpen(false)}
            />
            {/* Dropdown */}
            <div
              className="fixed z-[9999] bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px]"
              style={{
                top: `${menuPosition.top}px`,
                right: `${menuPosition.right}px`,
              }}
            >
              {languageList.map((item) => (
                <button
                  key={item.locale}
                  onClick={() => switchLanguage(item.locale)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    locale === item.locale
                      ? 'bg-purple-50 text-purple-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.flag}</span>
                  <span>{item.name}</span>
                  {locale === item.locale && (
                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

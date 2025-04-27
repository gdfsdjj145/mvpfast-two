import { useLocale } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';

export default function I18NComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = React.useRef<HTMLLabelElement>(null);

  // 计算下拉菜单位置
  const updateMenuPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      });
    }
  };

  // 切换菜单显示状态
  const toggleMenu = () => {
    if (!isOpen) {
      updateMenuPosition();
    }
    setIsOpen(!isOpen);
  };

  const languageList = [
    {
      name: '中文',
      locale: 'zh',
    },
    {
      name: 'English',
      locale: 'en',
    },
  ];

  const switchLanguage = (value: string) => {
    if (value !== locale) {
      let newPathName = pathname.replace(`/${locale}`, `/${value}`);
      if (!newPathName.startsWith(`/${value}`)) {
        newPathName = `/${value}${newPathName}`;
      }
      console.log(newPathName);
      router.push(newPathName);
    }
  };

  return (
    <div className="relative">
      <label
        ref={buttonRef}
        onClick={toggleMenu}
        className="btn btn-ghost btn-circle cursor-pointer"
      >
        <span className="text-base font-medium">
          <Languages />
        </span>
      </label>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-9999 shadow-lg"
            style={{
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
            }}
          >
            <ul className="menu p-2 bg-base-100 rounded-box w-32">
              {languageList.map((item) => (
                <li
                  key={item.locale}
                  className={`${
                    locale === item.locale ? 'bg-secondary text-white' : ''
                  }`}
                >
                  <button
                    onClick={() => {
                      switchLanguage(item.locale);
                      setIsOpen(false);
                    }}
                    className="py-2"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
            <div
              className="fixed inset-0 z-[-1]"
              onClick={() => setIsOpen(false)}
            />
          </div>,
          document.body
        )}
    </div>
  );
}

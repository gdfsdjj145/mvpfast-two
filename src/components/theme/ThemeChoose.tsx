'use client';

import { useEffect, useState } from 'react';
import { Palette, Check, Sun, Moon } from 'lucide-react';

// DaisyUI 内置主题列表
const THEMES = {
  light: [
    { name: 'light', label: 'Light' },
    { name: 'cupcake', label: 'Cupcake' },
    { name: 'bumblebee', label: 'Bumblebee' },
    { name: 'emerald', label: 'Emerald' },
    { name: 'corporate', label: 'Corporate' },
    { name: 'retro', label: 'Retro' },
    { name: 'cyberpunk', label: 'Cyberpunk' },
    { name: 'valentine', label: 'Valentine' },
    { name: 'garden', label: 'Garden' },
    { name: 'lofi', label: 'Lo-Fi' },
    { name: 'pastel', label: 'Pastel' },
    { name: 'fantasy', label: 'Fantasy' },
    { name: 'wireframe', label: 'Wireframe' },
    { name: 'cmyk', label: 'CMYK' },
    { name: 'autumn', label: 'Autumn' },
    { name: 'acid', label: 'Acid' },
    { name: 'lemonade', label: 'Lemonade' },
    { name: 'winter', label: 'Winter' },
  ],
  dark: [
    { name: 'dark', label: 'Dark' },
    { name: 'synthwave', label: 'Synthwave' },
    { name: 'halloween', label: 'Halloween' },
    { name: 'forest', label: 'Forest' },
    { name: 'aqua', label: 'Aqua' },
    { name: 'black', label: 'Black' },
    { name: 'luxury', label: 'Luxury' },
    { name: 'dracula', label: 'Dracula' },
    { name: 'business', label: 'Business' },
    { name: 'night', label: 'Night' },
    { name: 'coffee', label: 'Coffee' },
    { name: 'dim', label: 'Dim' },
    { name: 'nord', label: 'Nord' },
    { name: 'sunset', label: 'Sunset' },
  ],
};

// 主题预览组件
function ThemePreview({ theme, isActive, onClick }: {
  theme: { name: string; label: string };
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-full p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer
        hover:scale-[1.02] active:scale-[0.98]
        ${isActive
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-base-300 hover:border-base-content/20'
        }
      `}
      data-theme={theme.name}
      aria-label={`选择 ${theme.label} 主题`}
      aria-pressed={isActive}
    >
      {/* 主题色预览 */}
      <div className="flex items-center gap-3">
        <div className="grid grid-cols-4 h-8 w-16 rounded-lg overflow-hidden shadow-sm shrink-0">
          <div className="bg-base-100" />
          <div className="bg-base-200" />
          <div className="bg-base-content" />
          <div className="bg-primary" />
        </div>
        <span className="text-sm font-medium text-base-content truncate">
          {theme.label}
        </span>
      </div>

      {/* 选中标记 */}
      {isActive && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4 text-primary" aria-hidden="true" />
        </div>
      )}
    </button>
  );
}

export default function ThemeChoose() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isOpen, setIsOpen] = useState(false);

  // 从 localStorage 读取主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // 切换主题
  const handleThemeChange = (themeName: string) => {
    setCurrentTheme(themeName);
    localStorage.setItem('theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);
  };

  // 关闭抽屉
  const closeDrawer = () => {
    setIsOpen(false);
    const checkbox = document.getElementById('theme-drawer') as HTMLInputElement;
    if (checkbox) checkbox.checked = false;
  };

  return (
    <div className="hidden lg:block">
      <div className="drawer drawer-end">
        <input
          id="theme-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={isOpen}
          onChange={(e) => setIsOpen(e.target.checked)}
        />
        <div className="drawer-content">
          <label
            htmlFor="theme-drawer"
            className="flex items-center justify-center w-8 h-8 text-base-content/70 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors cursor-pointer"
            aria-label="主题设置"
          >
            <Palette className="w-[18px] h-[18px]" aria-hidden="true" />
          </label>
        </div>

        <div className="drawer-side z-[100]">
          <label
            htmlFor="theme-drawer"
            aria-label="关闭侧边栏"
            className="drawer-overlay"
          />
          <div className="bg-base-100 min-h-full w-80 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-base-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-base-content">
                  主题设置
                </h3>
                <button
                  onClick={closeDrawer}
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label="关闭"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-base-content/60 mt-1">
                选择你喜欢的主题风格
              </p>
            </div>

            {/* Theme List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Light Themes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-4 h-4 text-warning" aria-hidden="true" />
                  <span className="text-sm font-medium text-base-content">
                    亮色主题
                  </span>
                  <span className="badge badge-sm badge-ghost">
                    {THEMES.light.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {THEMES.light.map((theme) => (
                    <ThemePreview
                      key={theme.name}
                      theme={theme}
                      isActive={currentTheme === theme.name}
                      onClick={() => handleThemeChange(theme.name)}
                    />
                  ))}
                </div>
              </div>

              {/* Dark Themes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="w-4 h-4 text-info" aria-hidden="true" />
                  <span className="text-sm font-medium text-base-content">
                    暗色主题
                  </span>
                  <span className="badge badge-sm badge-ghost">
                    {THEMES.dark.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {THEMES.dark.map((theme) => (
                    <ThemePreview
                      key={theme.name}
                      theme={theme}
                      isActive={currentTheme === theme.name}
                      onClick={() => handleThemeChange(theme.name)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-base-200">
              <p className="text-xs text-base-content/50 text-center">
                主题由 DaisyUI 提供
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

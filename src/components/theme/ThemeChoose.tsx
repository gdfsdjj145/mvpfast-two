'use client';
import { Settings } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ThemeChoose() {
  const { setTheme } = useTheme();

  const handleThemeClick = () => {
    setTheme('light');
  };

  return (
    <div className="hidden lg:block">
      <div className="drawer drawer-end">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label
            htmlFor="my-drawer-4"
            className="flex items-center justify-center w-8 h-8 text-base-content/70 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors cursor-pointer"
            aria-label="应用设置"
          >
            <Settings className="w-[18px] h-[18px]" />
          </label>
        </div>
        <div className="drawer-side z-[100]">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          />
          <div className="bg-base-100 min-h-full w-80 p-6">
            <h3 className="text-lg font-semibold text-base-content mb-6">应用设置</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-base-content/70 mb-3">主题色（当前仅支持亮色主题）</p>
                <button
                  onClick={handleThemeClick}
                  className="w-full p-3 bg-base-200 hover:bg-base-300 rounded-xl border border-base-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid grid-cols-4 h-8 w-16 rounded-lg overflow-hidden" data-theme="light">
                      <div className="bg-base-100" />
                      <div className="bg-base-200" />
                      <div className="bg-base-content" />
                      <div className="bg-primary" />
                    </div>
                    <span className="text-sm text-base-content">Light</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

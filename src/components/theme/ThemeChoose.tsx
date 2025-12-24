'use client';
import { IoGridOutline } from 'react-icons/io5';
import { useTheme } from 'next-themes';

export const THEMES = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
];

export default function ThemeChoose() {
  const { theme, setTheme } = useTheme();

  // 强制保持亮色主题，禁用主题切换
  const handleThemeClick = () => {
    setTheme('light');
  };

  return (
    <div
      className="tooltip tooltip-bottom hidden lg:block z-10"
      data-tip="应用设置"
    >
      <div className="drawer drawer-end">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label htmlFor="my-drawer-4" className="drawer-button">
            <IoGridOutline
              className="cursor-pointer transition-all hover:scale-110"
              size={30}
            ></IoGridOutline>
          </label>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="bg-base-200 text-base-content min-h-full w-96 p-4">
            {/* Sidebar content here */}
            <li className="p-4 rounded-xl space-y-4">
              <div className="mb-1">主题色（当前仅支持亮色主题）</div>
              <div className="bg-base-100 grid grid-flow-col md: grid-rows-3 md:grid-rows-4 xl:md:grid-rows-5 gap-2 p-1 overflow-y-scroll max-w-xs md:max-w-md lg:max-w-xl xl:max-w-2xl justify-start">
                {/* 只显示 light 主题 */}
                <div
                  className="bg-base-200 hover:bg-base-300 duration-100 cursor-pointer rounded-xl p-4 border custom-cursor-on-hover"
                  onClick={handleThemeClick}
                >
                  <div className="rounded-lg relative duration-200 w-20 group drop-shadow-md">
                    <div
                      className="relative z-30 grid h-12 grid-cols-4 rounded-lg overflow-hidden"
                      data-theme="light"
                    >
                      <div className="h-full bg-base-100 rounded-l-lg"></div>
                      <div className="h-full bg-base-200"></div>
                      <div className="h-full bg-base-content"></div>
                      <div className="h-full bg-primary rounded-r-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

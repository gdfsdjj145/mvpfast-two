import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        xft: ['var(--font-xft)', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#374151',
            maxWidth: '100%',
            code: {
              color: '#111827',
              backgroundColor: '#F3F4F6',
              fontWeight: '500',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              '&::before': {
                content: 'none',
              },
              '&::after': {
                content: 'none',
              },
            },
            pre: {
              color: '#F3F4F6',
              backgroundColor: '#1a1b26',
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              margin: '1.5rem 0',
              '& code': {
                backgroundColor: 'transparent',
                border: 'none',
                color: 'inherit',
                fontSize: 'inherit',
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                padding: '0',
              },
              // 移除任何默认的块级显示属性
              display: 'block',
              width: '100%',
              overflow: 'auto',
              whiteSpace: 'pre',
            },
            'div pre': {
              margin: '0',
              padding: '1rem',
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
          },
        },
      },
    },
  },
  darkMode: ['class', '[data-theme="dark"]'],
  plugins: [require('daisyui'), require('@tailwindcss/typography')],
  daisyui: {
    themes: true,
  },
};

export default config;

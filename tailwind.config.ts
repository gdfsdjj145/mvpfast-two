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
            lineHeight: '1.8',
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
              fontSize: '1.05rem',
              lineHeight: '1.75',
            },
            h1: {
              marginTop: '2em',
              marginBottom: '1em',
              fontSize: '2.25rem',
              fontWeight: '700',
              lineHeight: '1.3',
            },
            h2: {
              marginTop: '1.75em',
              marginBottom: '0.75em',
              fontSize: '1.75rem',
              fontWeight: '600',
              lineHeight: '1.35',
            },
            h3: {
              marginTop: '1.5em',
              marginBottom: '0.75em',
              fontSize: '1.375rem',
              fontWeight: '600',
              lineHeight: '1.4',
            },
            ul: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
              paddingLeft: '1.625em',
              li: {
                marginTop: '0.5em',
                marginBottom: '0.5em',
              },
            },
            ol: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
              paddingLeft: '1.625em',
              li: {
                marginTop: '0.5em',
                marginBottom: '0.5em',
              },
            },
            code: {
              backgroundColor: 'transparent',
              padding: '0',
              fontWeight: '400',
              '&::before': { content: 'none' },
              '&::after': { content: 'none' },
            },
            pre: {
              padding: '0',
              margin: '0',
              backgroundColor: 'transparent',
            },
            blockquote: {
              marginTop: '1.5em',
              marginBottom: '1.5em',
              paddingLeft: '1.25em',
              borderLeftWidth: '4px',
              borderLeftColor: '#E5E7EB',
              fontStyle: 'italic',
              color: '#4B5563',
            },
            table: {
              marginTop: '1.5em',
              marginBottom: '1.5em',
              fontSize: '0.95em',
            },
            hr: {
              marginTop: '2em',
              marginBottom: '2em',
              borderColor: '#E5E7EB',
            },
            a: {
              color: '#2563EB',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
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

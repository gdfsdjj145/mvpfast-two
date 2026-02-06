import { docs, blogs } from './.source/server';
import { loader } from 'fumadocs-core/source';
import { createElement } from 'react';
import {
  BookOpen,
  Puzzle,
  LayoutGrid,
  Database,
  CreditCard,
} from 'lucide-react';

// meta.json 中 icon 字符串 → React 组件的映射
const icons: Record<string, React.ReactElement> = {
  Introduction: createElement(BookOpen, { size: 18 }),
  Features: createElement(Puzzle, { size: 18 }),
  Components: createElement(LayoutGrid, { size: 18 }),
  Database: createElement(Database, { size: 18 }),
  Payment: createElement(CreditCard, { size: 18 }),
};

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  icon(icon) {
    if (icon && icon in icons) return icons[icon];
  },
});

export const blogSource = loader({
  baseUrl: '/blog',
  source: blogs.toFumadocsSource(),
});

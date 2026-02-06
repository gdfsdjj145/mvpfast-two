import { docs, blogs } from './.source/server';
import { loader } from 'fumadocs-core/source';
import { createElement } from 'react';
import {
  BookOpen,
  Puzzle,
  LayoutGrid,
  Database,
  CreditCard,
  Play,
  Cpu,
  Book,
  Brain,
  MessageSquare,
} from 'lucide-react';

// meta.json 中 icon 字符串 → React 组件的映射
const icons: Record<string, React.ReactElement> = {
  Cpu: createElement(Cpu, { size: 18 }),
  Play: createElement(Play, { size: 18 }),
  Brain: createElement(Brain, { size: 18 }),
  Book: createElement(Book, { size: 18 }),
  Introduction: createElement(BookOpen, { size: 18 }),
  Features: createElement(Puzzle, { size: 18 }),
  Components: createElement(LayoutGrid, { size: 18 }),
  Database: createElement(Database, { size: 18 }),
  Payment: createElement(CreditCard, { size: 18 }),
  MessageSquare: createElement(MessageSquare, { size: 18 }),
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

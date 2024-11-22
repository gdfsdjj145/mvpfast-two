import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import path from 'path';

const prettyCodeOptions = {
  theme: 'github-dark',
  onVisitLine(node: any) {
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
  },
  onVisitHighlightedLine(node: any) {
    node.properties.className.push('highlighted');
  },
  onVisitHighlightedWord(node: any) {
    node.properties.className = ['word'];
  },
};

export const DocPage = defineDocumentType(() => ({
  name: 'DocPage',
  filePathPattern: `docs/**/*.md`,
  fields: {
    key: { type: 'string', required: true },
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    order: { type: 'number', required: true },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/${doc._raw.flattenedPath}`,
    },
    folder: {
      type: 'string',
      resolve: (doc) => {
        const parts = doc._raw.flattenedPath.split('/');
        return parts.length > 2 ? parts[1] : 'root';
      },
    },
    headings: {
      type: 'json',
      resolve: async (doc) => {
        const headings: { level: number; text: string; slug: string }[] = [];
        const regex = /^#{1,6}\s+(.+)$/gm;
        const matches: any = doc.body.raw.matchAll(regex);

        for (const match of matches) {
          const level = match[0].indexOf(' ');
          const text = match[1];
          const slug = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          headings.push({ level, text, slug });
        }

        return headings;
      },
    },
  },
}));
// 博客文章类型定义
export const BlogPost = defineDocumentType(() => ({
  name: 'BlogPost',
  filePathPattern: `blog/**/*.md`,
  fields: {
    key: { type: 'string', required: true },
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    description: { type: 'string', required: true },
    coverImage: { type: 'string', required: false },
    category: { type: 'string', required: false },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (post) => `/${post._raw.flattenedPath}`,
    },
    coverImagePath: {
      type: 'string',
      resolve: (post) => {
        if (post.coverImage) {
          return path.join('content/blog/assets', post.coverImage);
        }
        return null;
      },
    },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [DocPage, BlogPost],
});

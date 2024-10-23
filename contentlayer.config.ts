import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import path from 'path';

// 定义博客内容类型
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

// 定义文档内容类型
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
  },
}));

export default makeSource({
  disableImportAliasWarning: true,
  contentDirPath: 'content',
  documentTypes: [BlogPost, DocPage],
});

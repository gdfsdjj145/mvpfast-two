import { defineDocumentType, makeSource } from 'contentlayer/source-files';

// 定义博客内容类型
export const BlogPost = defineDocumentType(() => ({
  name: 'BlogPost',
  filePathPattern: `blog/**/*.md`,
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (post) => `/${post._raw.flattenedPath}`,
    },
  },
}));

// 定义文档内容类型
export const DocPage = defineDocumentType(() => ({
  name: 'DocPage',
  filePathPattern: `docs/**/*.md`,
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/${doc._raw.flattenedPath}`,
    },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [BlogPost, DocPage],
});

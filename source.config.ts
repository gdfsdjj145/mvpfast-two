import {  frontmatterSchema, metaSchema, defineDocs  } from 'fumadocs-mdx/config';
import { z } from 'zod'; 

export const docs = defineDocs({
  dir: 'content/docs'
});

export const blogs = defineDocs({
  dir: 'content/blog',
  docs: {
    schema: frontmatterSchema.extend({
      index: z.boolean().default(false),
      date: z.date()
    }),
  },
  meta: {
    schema: metaSchema.extend({
      // other props
    }),
  },
});
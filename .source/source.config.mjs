// source.config.ts
import { frontmatterSchema, metaSchema, defineDocs } from "fumadocs-mdx/config";
import { z } from "zod";
var docs = defineDocs({
  dir: "content/docs"
});
var blogs = defineDocs({
  dir: "content/blog",
  docs: {
    schema: frontmatterSchema.extend({
      index: z.boolean().default(false),
      date: z.date()
    })
  },
  meta: {
    schema: metaSchema.extend({
      // other props
    })
  }
});
export {
  blogs,
  docs
};

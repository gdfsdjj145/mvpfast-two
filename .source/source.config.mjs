// source.config.ts
import { defineDocs } from "fumadocs-mdx/config";
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    // options for `doc` collection
  },
  meta: {
    // options for `meta` collection
  }
});
var blogs = defineDocs({
  dir: "content/blog",
  docs: {
    // options for `blog` collection
  },
  meta: {
    // options for `meta` collection
  }
});
export {
  blogs,
  docs
};

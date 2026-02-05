// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  blogs: create.doc("blogs", {"commercial.mdx": () => import("../content/blog/commercial.mdx?collection=blogs"), "question.mdx": () => import("../content/blog/question.mdx?collection=blogs"), }),
  docs: create.doc("docs", {"api-reference.mdx": () => import("../content/docs/api-reference.mdx?collection=docs"), "commercial.mdx": () => import("../content/docs/commercial.mdx?collection=docs"), "features.mdx": () => import("../content/docs/features.mdx?collection=docs"), "getting-started.mdx": () => import("../content/docs/getting-started.mdx?collection=docs"), "introduction.mdx": () => import("../content/docs/introduction.mdx?collection=docs"), "question.mdx": () => import("../content/docs/question.mdx?collection=docs"), }),
};
export default browserCollections;
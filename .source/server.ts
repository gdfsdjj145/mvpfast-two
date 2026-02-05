// @ts-nocheck
import * as __fd_glob_7 from "../content/docs/question.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/introduction.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/getting-started.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/features.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/commercial.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/api-reference.mdx?collection=docs"
import * as __fd_glob_1 from "../content/blog/question.mdx?collection=blogs"
import * as __fd_glob_0 from "../content/blog/commercial.mdx?collection=blogs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const blogs = await create.docs("blogs", "content/blog", {}, {"commercial.mdx": __fd_glob_0, "question.mdx": __fd_glob_1, });

export const docs = await create.docs("docs", "content/docs", {}, {"api-reference.mdx": __fd_glob_2, "commercial.mdx": __fd_glob_3, "features.mdx": __fd_glob_4, "getting-started.mdx": __fd_glob_5, "introduction.mdx": __fd_glob_6, "question.mdx": __fd_glob_7, });
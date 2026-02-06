// @ts-nocheck
import * as __fd_glob_35 from "../content/docs/start/vercel.mdx?collection=docs"
import * as __fd_glob_34 from "../content/docs/start/start.mdx?collection=docs"
import * as __fd_glob_33 from "../content/docs/start/preparation.mdx?collection=docs"
import * as __fd_glob_32 from "../content/docs/start/github.mdx?collection=docs"
import * as __fd_glob_31 from "../content/docs/pay/yungouos.mdx?collection=docs"
import * as __fd_glob_30 from "../content/docs/pay/stripe.mdx?collection=docs"
import * as __fd_glob_29 from "../content/docs/pay/pay.mdx?collection=docs"
import * as __fd_glob_28 from "../content/docs/database/supabase.mdx?collection=docs"
import * as __fd_glob_27 from "../content/docs/database/mongodb.mdx?collection=docs"
import * as __fd_glob_26 from "../content/docs/components/Table.mdx?collection=docs"
import * as __fd_glob_25 from "../content/docs/components/Price.mdx?collection=docs"
import * as __fd_glob_24 from "../content/docs/components/LandingPage.mdx?collection=docs"
import * as __fd_glob_23 from "../content/docs/components/Hero.mdx?collection=docs"
import * as __fd_glob_22 from "../content/docs/components/Header.mdx?collection=docs"
import * as __fd_glob_21 from "../content/docs/components/Footer.mdx?collection=docs"
import * as __fd_glob_20 from "../content/docs/components/Features.mdx?collection=docs"
import * as __fd_glob_19 from "../content/docs/components/FeatureGrid.mdx?collection=docs"
import * as __fd_glob_18 from "../content/docs/components/FeatureCard.mdx?collection=docs"
import * as __fd_glob_17 from "../content/docs/components/FaqList.mdx?collection=docs"
import * as __fd_glob_16 from "../content/docs/components/Faq.mdx?collection=docs"
import * as __fd_glob_15 from "../content/docs/components/ClipboardBtn.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/components/Case.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/Features/wechatLogin.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/Features/wechat.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/Features/phone.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/Features/google.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/Features/email.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/introduction.mdx?collection=docs"
import { default as __fd_glob_7 } from "../content/docs/start/meta.json?collection=docs"
import { default as __fd_glob_6 } from "../content/docs/pay/meta.json?collection=docs"
import { default as __fd_glob_5 } from "../content/docs/components/meta.json?collection=docs"
import { default as __fd_glob_4 } from "../content/docs/database/meta.json?collection=docs"
import { default as __fd_glob_3 } from "../content/docs/Features/meta.json?collection=docs"
import { default as __fd_glob_2 } from "../content/docs/meta.json?collection=docs"
import * as __fd_glob_1 from "../content/blog/question.mdx?collection=blogs"
import * as __fd_glob_0 from "../content/blog/commercial.mdx?collection=blogs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const blogs = await create.docs("blogs", "content/blog", {}, {"commercial.mdx": __fd_glob_0, "question.mdx": __fd_glob_1, });

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_2, "Features/meta.json": __fd_glob_3, "database/meta.json": __fd_glob_4, "components/meta.json": __fd_glob_5, "pay/meta.json": __fd_glob_6, "start/meta.json": __fd_glob_7, }, {"introduction.mdx": __fd_glob_8, "Features/email.mdx": __fd_glob_9, "Features/google.mdx": __fd_glob_10, "Features/phone.mdx": __fd_glob_11, "Features/wechat.mdx": __fd_glob_12, "Features/wechatLogin.mdx": __fd_glob_13, "components/Case.mdx": __fd_glob_14, "components/ClipboardBtn.mdx": __fd_glob_15, "components/Faq.mdx": __fd_glob_16, "components/FaqList.mdx": __fd_glob_17, "components/FeatureCard.mdx": __fd_glob_18, "components/FeatureGrid.mdx": __fd_glob_19, "components/Features.mdx": __fd_glob_20, "components/Footer.mdx": __fd_glob_21, "components/Header.mdx": __fd_glob_22, "components/Hero.mdx": __fd_glob_23, "components/LandingPage.mdx": __fd_glob_24, "components/Price.mdx": __fd_glob_25, "components/Table.mdx": __fd_glob_26, "database/mongodb.mdx": __fd_glob_27, "database/supabase.mdx": __fd_glob_28, "pay/pay.mdx": __fd_glob_29, "pay/stripe.mdx": __fd_glob_30, "pay/yungouos.mdx": __fd_glob_31, "start/github.mdx": __fd_glob_32, "start/preparation.mdx": __fd_glob_33, "start/start.mdx": __fd_glob_34, "start/vercel.mdx": __fd_glob_35, });
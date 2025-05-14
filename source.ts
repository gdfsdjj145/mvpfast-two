import { docs, blogs } from './.source';
import { loader } from 'fumadocs-core/source';
 
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});


export const blogSource = loader({
  baseUrl: "/blog",
  source: blogs.toFumadocsSource(),
});
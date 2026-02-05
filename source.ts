import { docs, blogs } from './.source/server';
import { loader } from 'fumadocs-core/source';
 
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});


export const blogSource = loader({
  baseUrl: "/blog",
  source: blogs.toFumadocsSource(),
});
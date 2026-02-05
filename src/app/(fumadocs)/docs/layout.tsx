import { source } from '../../../../source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '../layout.config';
 
export default function Layout({ children }: { children: ReactNode }) {
  return (
       // @ts-ignore
       <DocsLayout
       tree={source.pageTree}
       {...baseOptions}
       >
         {children}
       </DocsLayout>
  );
}
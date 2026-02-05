'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default function PageProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      NProgress.configure({ showSpinner: false });
      NProgress.start();

      const timer = setTimeout(() => {
        NProgress.done();
      }, 500);

      return () => {
        clearTimeout(timer);
        NProgress.done();
      };
    }
  }, [pathname, searchParams, isMounted]);

  return <></>;
}

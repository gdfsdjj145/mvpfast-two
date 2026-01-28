'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchPublicConfigs, selectGoogleAnalyticsId, selectPublicConfigLoaded } from '@/store/publicConfig';

export default function GoogleAnalytics() {
  const dispatch = useAppDispatch();
  const gaId = useAppSelector(selectGoogleAnalyticsId);
  const loaded = useAppSelector(selectPublicConfigLoaded);

  useEffect(() => {
    dispatch(fetchPublicConfigs());
  }, [dispatch]);

  if (!loaded || !gaId) {
    return null;
  }

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script id="ga-script" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}

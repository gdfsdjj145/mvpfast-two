'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function GoogleAnalytics() {
  const [gaId, setGaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGaId = async () => {
      try {
        const response = await fetch('/api/admin/configs/public?key=analytics.googleAnalyticsId');
        if (response.ok) {
          const data = await response.json();
          if (data.value) {
            setGaId(data.value);
          }
        }
      } catch (error) {
        console.error('Failed to fetch Google Analytics ID:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGaId();
  }, []);

  // 不渲染任何内容直到加载完成，且只有配置了 ID 才渲染脚本
  if (isLoading || !gaId) {
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

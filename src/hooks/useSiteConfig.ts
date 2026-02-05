'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchPublicConfigs, selectSiteName, selectPublicConfigLoaded } from '@/store/publicConfig';

export function useSiteConfig() {
  const dispatch = useAppDispatch();
  const siteName = useAppSelector(selectSiteName);
  const loaded = useAppSelector(selectPublicConfigLoaded);

  useEffect(() => {
    dispatch(fetchPublicConfigs());
  }, [dispatch]);

  return {
    siteConfig: { siteName },
    loading: !loaded,
  };
}

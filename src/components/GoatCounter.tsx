'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

declare global {
  interface Window {
    goatcounter?: {
      count: (vars?: { path?: string; title?: string; event?: boolean }) => void;
    };
  }
}

export function GoatCounter() {
  const pathname = usePathname();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // The initial pageview is automatically tracked when count.js loads
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    if (typeof window !== 'undefined' && window.goatcounter?.count) {
      window.goatcounter.count({
        path: pathname + window.location.search,
      });
    }
  }, [pathname]);

  return (
    <Script
      data-goatcounter="https://chiragrajdeo.goatcounter.com/count"
      src="https://gc.zgo.at/count.js"
      strategy="afterInteractive"
    />
  );
}

"use client";

import Script from "next/script";
import { useSettings } from "./use-settings";

export function GoogleAds() {
  const { settings } = useSettings();
  const id = settings?.googleAdsId;

  if (!id) return null;

  return (
    <Script id="google-ads" strategy="afterInteractive">
      {`
        gtag('config', '${id}');
      `}
    </Script>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@lib/api";

interface SiteSettings {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  googleAdsId?: string;
  googleAdsLabel?: string;
  facebookPixelId?: string;
  headerHtml?: string;
  footerHtml?: string;
  maintenanceEnabled?: boolean;
  maintenanceMessage?: string;
}

export function useSettings() {
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<{ data: SiteSettings }>("/settings"),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return { settings: data?.data };
}

"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "@providers/query-provider";
import { ThemeProvider } from "@providers/theme-provider";
import { AuthProvider } from "@providers/auth-provider";
import { ToastProvider } from "@providers/toast-provider";
import DOMPurify from "dompurify";
import { GoogleAnalytics, GoogleTagManager, GoogleAds, FacebookPixel, useSettings } from "@components/tracking";
import { AffiliateTracker } from "@components/affiliate/affiliate-tracker";
import { MaintenanceCheck } from "./maintenance-check";

function TrackingScripts() {
  const { settings } = useSettings();
  return (
    <>
      <GoogleAnalytics />
      <GoogleTagManager />
      <GoogleAds />
      <FacebookPixel />
      {settings?.headerHtml && (
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(settings.headerHtml) }} />
      )}
    </>
  );
}

function FooterScripts() {
  const { settings } = useSettings();
  if (!settings?.footerHtml) return null;
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(settings.footerHtml) }} />;
}

interface RootLayoutProps {
  children: ReactNode;
  locale?: string;
}

export function RootLayout({ children, locale = "en" }: RootLayoutProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <TrackingScripts />
            <AffiliateTracker />
            <MaintenanceCheck>{children}</MaintenanceCheck>
            <FooterScripts />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

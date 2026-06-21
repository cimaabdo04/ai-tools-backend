import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { APP_NAME } from "@/lib/constants";
import { NextIntlClientProvider } from "next-intl";
import { RootLayout as AppProviders } from "@/components/layout/root-layout";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { HtmlLangSetter } from "@/components/common/html-lang";
import arMessages from "../i18n/messages/ar.json";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
    description: "اكتشف وقارن أفضل أدوات الذكاء الاصطناعي. أكثر من 500 أداة AI.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — اكتشف أفضل أدوات AI`,
    description: "اكتشف وقارن أفضل أدوات الذكاء الاصطناعي. أكثر من 500 أداة AI.",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: APP_NAME,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: "اكتشف وقارن أفضل أدوات الذكاء الاصطناعي",
    images: ["/og-image.png"],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html dir="rtl" lang="ar" suppressHydrationWarning className={cairo.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background font-arabic antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale="ar" messages={arMessages} timeZone="Asia/Riyadh">
          <AppProviders locale="ar">
            <HtmlLangSetter />
            <script
              dangerouslySetInnerHTML={{
                __html: `
(function(){
  var o = new MutationObserver(function(){
    var els = document.querySelectorAll("[bis_skin_checked]");
    for(var i=0;i<els.length;i++){els[i].removeAttribute("bis_skin_checked")}
  });
  o.observe(document.documentElement,{attributes:true,attributeFilter:["bis_skin_checked"],subtree:true});
  setTimeout(function(){o.disconnect()},5e3);
})();
`,
              }}
            />
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <MobileNav />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

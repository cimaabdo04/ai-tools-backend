import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "المدونة | دليل شامل لأدوات الذكاء الاصطناعي",
  description:
    "اكتشف أحدث أخبار أدوات الذكاء الاصطناعي، مراجعات متعمقة، دروس تعليمية، وأدلة شاملة لاختيار أفضل أدوات AI. مقالات بالعربية.",
  path: "/blog",
});

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}

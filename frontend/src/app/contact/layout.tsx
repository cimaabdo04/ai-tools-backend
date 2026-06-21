import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "Contact Us",
  description: "Get in touch with the AI Tools Directory team.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

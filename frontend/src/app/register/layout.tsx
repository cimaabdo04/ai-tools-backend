import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "Sign Up",
  path: "/register",
  noIndex: true,
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

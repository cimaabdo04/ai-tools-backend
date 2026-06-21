import { seoMetadata } from "@components/common/seo-head";
import type { Metadata } from "next";

export const metadata: Metadata = seoMetadata({
  title: "Forgot Password",
  description: "Reset your AI Tools Directory account password.",
  path: "/forgot-password",
});

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

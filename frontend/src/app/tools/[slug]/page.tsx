import { Metadata } from "next";
import { ToolDetailClient } from "./tool-detail-client";

interface Params { slug: string; locale: string }

async function getTool(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  try {
    const res = await fetch(`${apiUrl}/tools/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) return { title: "Tool not found" };
  return {
    title: tool.seoTitle || tool.name,
    description: tool.seoDescription || tool.description?.slice(0, 160),
    openGraph: {
      title: tool.name,
      description: tool.description?.slice(0, 160),
      ...(tool.logoUrl ? { images: [{ url: tool.logoUrl }] } : {}),
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.name,
      description: tool.description?.slice(0, 160),
      ...(tool.logoUrl ? { images: [tool.logoUrl] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug, locale } = await params;
  const initialData = await getTool(slug);
  return <ToolDetailClient initialData={initialData} slug={slug} locale={locale} />;
}

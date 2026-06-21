import { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const BEST_PAGES = [
  "best-ai-tools",
  "best-ai-image-generators",
  "best-ai-writing-tools",
];

const USE_CASE_PAGES = [
  "tools-for-content-creation",
  "tools-for-marketing",
  "tools-for-designers",
  "tools-for-developers",
];

const QUESTION_PAGES = [
  "what-are-ai-tools",
  "what-is-chatgpt",
  "how-to-choose-ai-tool",
];

const STATIC_PAGES = ["", "about", "contact", "faq", "pricing", "blog", ...BEST_PAGES, ...USE_CASE_PAGES, ...QUESTION_PAGES];

interface Tool { slug: string; updatedAt: string }
interface Category { slug: string; updatedAt: string }
interface BlogPost { slug: string; updatedAt: string }

async function fetchAll<T>(url: string, dataKey?: string): Promise<T[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const json = await res.json();
    const payload = json?.data ?? json;
    if (dataKey && payload?.[dataKey]) return payload[dataKey];
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    return [];
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tools, categories, blogPosts] = await Promise.all([
    fetchAll<Tool>(`${API_URL}/tools?take=100`, 'tools'),
    fetchAll<Category>(`${API_URL}/categories`),
    fetchAll<BlogPost>(`${API_URL}/cms/blog?take=100`),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const page of STATIC_PAGES) {
    entries.push({
      url: `${APP_URL}/${page}`.replace(/\/+$/, ""),
      lastModified: new Date(),
      changeFrequency: page === "" ? "weekly" : "monthly",
      priority: page === "" ? 1.0 : 0.8,
    });
  }

  for (const tool of tools) {
    entries.push({
      url: `${APP_URL}/tools/${tool.slug}`,
      lastModified: tool.updatedAt && typeof tool.updatedAt === 'string' ? new Date(tool.updatedAt) : new Date("2025-01-01"),
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  for (const category of categories) {
    entries.push({
      url: `${APP_URL}/categories/${category.slug}`,
      lastModified: category.updatedAt && typeof category.updatedAt === 'string' ? new Date(category.updatedAt) : new Date("2025-01-01"),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const post of blogPosts) {
    entries.push({
      url: `${APP_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt && typeof post.updatedAt === 'string' ? new Date(post.updatedAt) : new Date("2025-01-01"),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}

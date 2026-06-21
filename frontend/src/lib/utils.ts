import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, fmt = "MMM d, yyyy") {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return format(d, fmt);
}

export function formatRelativeDate(date: string | Date | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function truncate(str: string, length = 100) {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + "...";
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function absoluteUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}${path}`;
}

export function getInitials(name: string | null | undefined) {
  return (name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function randomId() {
  return Math.random().toString(36).substring(2, 11);
}

export function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const CATEGORY_NAMES_AR: Record<string, string> = {
  "image-generation": "توليد الصور",
  "text-writing": "الكتابة والمحتوى",
  video: "الفيديو والأنيميشن",
  "code-development": "البرمجة والتطوير",
  "audio-music": "الصوت والموسيقى",
  "design-art": "التصميم والفنون",
  "research-analysis": "البحث والتحليل",
  productivity: "الإنتاجية والأدوات",
  "marketing-sales": "التسويق والمبيعات",
  "3d-modeling": "النمذجة ثلاثية الأبعاد",
  education: "التعليم والتدريب",
  ecommerce: "التجارة الإلكترونية",
  gaming: "الألعاب والترفيه",
};

export function getCategoryName(category: { name: string; slug: string }): string {
  return CATEGORY_NAMES_AR[category.slug] || category.name;
}

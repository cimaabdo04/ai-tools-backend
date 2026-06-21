import { Metadata } from "next";
import { APP_NAME, APP_DESCRIPTION, APP_URL } from "./constants";

interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
  tags?: string[];
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description = APP_DESCRIPTION,
  path = "",
  image = "/og-image.png",
  type = "website",
  publishedTime,
  author,
  tags,
  noIndex,
}: SeoProps): Metadata {
  const fullTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;
  const url = `${APP_URL}${path}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(APP_URL),
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: APP_NAME,
      locale: "ar_SA",
      type,
      images: [{ url: image, width: 1200, height: 630 }],
      ...(publishedTime && { publishedTime }),
      ...(author && { authors: [author] }),
      ...(tags && { tags }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

export function jsonLd<T>(schema: T): string {
  return JSON.stringify(schema);
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: APP_URL,
    description: APP_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${APP_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    sameAs: [
      "https://twitter.com/aitoolsdirectory",
      "https://github.com/aitoolsdirectory",
    ],
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${APP_URL}${item.url}`,
    })),
  };
}

export function toolSchema(tool: {
  name: string;
  description: string;
  url: string;
  image?: string;
  category?: string;
  pricing?: string;
  rating?: number;
  reviewCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.url,
    ...(tool.image && { image: tool.image }),
    ...(tool.category && { applicationCategory: tool.category }),
    ...(tool.pricing && { offers: { "@type": "Offer", price: tool.pricing } }),
    ...(tool.rating &&
      tool.reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: tool.rating,
          reviewCount: tool.reviewCount,
        },
      }),
  };
}

export function articleSchema(article: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  author: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    author: { "@type": "Person", name: article.author },
    url: article.url,
  };
}

export function faqSchema(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}

interface SeoInput {
  title: string;
  description: string;
  siteName?: string;
  url?: string;
  imageUrl?: string;
  type?: string;
  locale?: string;
  canonicalUrl?: string;
  tags?: string[];
  authorName?: string;
  publishedAt?: Date;
}

export function generateSeoMeta(input: SeoInput) {
  const siteName = input.siteName || 'AI Tools Directory';
  const type = input.type || 'website';
  const locale = input.locale || 'en_US';

  return {
    title: `${input.title} | ${siteName}`,
    description: input.description,
    openGraph: {
      title: `${input.title} | ${siteName}`,
      description: input.description,
      url: input.url,
      site_name: siteName,
      type,
      locale,
      ...(input.imageUrl && { images: [{ url: input.imageUrl, width: 1200, height: 630 }] }),
      ...(input.publishedAt && { published_time: input.publishedAt.toISOString() }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${input.title} | ${siteName}`,
      description: input.description,
      ...(input.imageUrl && { image: input.imageUrl }),
    },
    ...(input.canonicalUrl && { canonical: input.canonicalUrl }),
    ...(input.tags && input.tags.length > 0 && { keywords: input.tags.join(', ') }),
  };
}

export function truncateSeoDescription(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

"use client";

import { use, useEffect, useState } from "react";
import DOMPurify from "dompurify";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  ArrowLeft,
  Tag,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  BookOpen,
  ChevronRight,
  Eye,
  MessageCircle,
  Send,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";
import { ROUTES } from "@lib/constants";
import { formatDate, cn } from "@lib/utils";
import { useBlogPost, BlogPost, useBlogPosts } from "@hooks/use-blog";
import { useTools } from "@hooks/use-tools";
import { useToast } from "@components/ui/use-toast";

// Reading time calculation
function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const textLength = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.ceil(textLength / wordsPerMinute);
}

// Copy link to clipboard
function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "تم نسخ الرابط!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "فشل نسخ الرابط", variant: "destructive" });
    }
  };

  return { copied, copy };
}

// Table of Contents Component
function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    // Parse headings from HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const headingElements = tempDiv.querySelectorAll("h2, h3, h4");

    const extractedHeadings = Array.from(headingElements).map((el) => {
      const id = el.id || el.textContent?.toLowerCase().replace(/\s+/g, "-") || "";
      return {
        id,
        text: el.textContent || "",
        level: parseInt(el.tagName.charAt(1)),
      };
    });

    setHeadings(extractedHeadings);
  }, [content]);

  if (headings.length < 3) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-5">
        <h3 className="font-bold flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          محتويات المقال
        </h3>
        <nav className="space-y-1">
          {headings.map((heading, index) => (
            <button
              key={index}
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "w-full text-right text-sm py-1.5 px-2 rounded-md hover:bg-muted transition-colors line-clamp-2 text-right",
                heading.level === 2 && "font-medium",
                heading.level > 2 && "pr-4 text-muted-foreground"
              )}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}

// Author Bio Component
function AuthorBio({ authorName }: { authorName: string }) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
            {authorName?.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold mb-1">{authorName}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              كاتب ومحرر متخصص في تقنيات الذكاء الاصطناعي، يقدم محتوى تعليمياً
              ومراجعات متعمقة لأكثر من 5 سنوات
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="ghost" size="sm" className="h-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Related Tools Section
function RelatedTools({ tags }: { tags: string[] }) {
  const { data: toolsData } = useTools({ perPage: 4 });

  if (!toolsData?.data?.length) return null;

  const tools = toolsData.data.slice(0, 4);

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">أدوات ذكاء اصطناعي ذات صلة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link key={tool.id} href={ROUTES.TOOL_DETAIL(tool.slug)}>
            <Card className="hover:shadow-md hover:border-primary/30 transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                {tool.logoUrl && (
                  <img
                    src={tool.logoUrl}
                    alt={tool.name}
                    className="w-12 h-12 rounded-lg object-contain bg-white"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {tool.tagline}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Related Posts Section - "لا يفوتك"
function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const locale = useLocale();
  const { data } = useBlogPosts({ take: 3, locale });
  const posts = data?.data?.filter((p) => p.slug !== currentSlug).slice(0, 3) || [];

  if (posts.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-xl font-bold mb-6">لا يفوتك</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link key={post.id} href={`${ROUTES.BLOG}/${post.slug}`} className="group">
            <Card className="h-full hover:shadow-md transition-all overflow-hidden">
              {post.coverImage && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <CardContent className="p-3.5">
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Social Share Buttons
function ShareButtons({ title, url }: { title: string; url: string }) {
  const { copied, copy } = useCopyToClipboard();
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = [
    {
      name: "فيسبوك",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-blue-600 hover:text-white",
    },
    {
      name: "تويتر",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:bg-sky-500 hover:text-white",
    },
    {
      name: "واتساب",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:bg-green-600 hover:text-white",
    },
    {
      name: "تيليجرام",
      icon: Send,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:bg-sky-600 hover:text-white",
    },
    {
      name: "لينكد إن",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:bg-blue-700 hover:text-white",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">مشاركة:</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "w-9 h-9 rounded-full border flex items-center justify-center transition-all",
            link.color
          )}
        >
          <link.icon className="h-4 w-4" />
        </a>
      ))}
      <Button
        variant="outline"
        size="icon"
        className="w-9 h-9 rounded-full"
        onClick={() => copy(url)}
      >
        <LinkIcon className={cn("h-4 w-4", copied && "text-green-500")} />
      </Button>
    </div>
  );
}

// Tags List
function TagsList({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Tag className="h-4 w-4 text-muted-foreground" />
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  );
}

// Most Read Sidebar - Numbered List
function MostRead({ currentSlug }: { currentSlug: string }) {
  const locale = useLocale();
  const { data } = useBlogPosts({ take: 6, locale });
  const posts = data?.data?.filter((p) => p.slug !== currentSlug).slice(0, 5) || [];

  if (posts.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-bold text-sm mb-4">الأكثر قراءة</h3>
        <div className="space-y-3">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`${ROUTES.BLOG}/${post.slug}`}
              className="flex gap-2.5 group"
            >
              {post.coverImage && (
                <div className="w-14 h-14 shrink-0 rounded overflow-hidden bg-muted">
                  <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
                {post.viewCount > 0 && (
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {post.viewCount} مشاهدة
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Loading State
function LoadingState() {
  return (
    <div className="container py-8 max-w-4xl">
      <Skeleton className="h-8 w-32 mb-6" />
      <Skeleton className="h-4 w-48 mb-4" />
      <Skeleton className="h-12 w-full mb-6" />
      <Skeleton className="aspect-video rounded-xl mb-8" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/6" />
      </div>
    </div>
  );
}

// Not Found State
function NotFoundState() {
  const t = useTranslations();

  return (
    <div className="container py-20 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold mb-2">المقال غير موجود</h1>
      <p className="text-muted-foreground mb-6">
        عذراً، لم نتمكن من العثور على هذا المقال
      </p>
      <Button asChild>
        <Link href={ROUTES.BLOG}>العودة للمدونة</Link>
      </Button>
    </div>
  );
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = use(params);
  const t = useTranslations();
  const isRtl = locale === "ar";
  const { toast } = useToast();

  const { data, isLoading } = useBlogPost(slug);
  const post = data?.data;

  const readingTime = post ? getReadingTime(post.content) : 0;
  const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${ROUTES.BLOG}/${slug}`;

  // Add IDs to headings for table of contents
  useEffect(() => {
    if (post?.content) {
      const contentDiv = document.getElementById("article-content");
      if (contentDiv) {
        const headings = contentDiv.querySelectorAll("h2, h3, h4");
        headings.forEach((heading, index) => {
          if (!heading.id) {
            heading.id = `heading-${index}`;
          }
        });
      }
    }
  }, [post?.content]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!post) {
    return <NotFoundState />;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.authorName,
      url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Aiatlas",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/logo.png`,
      },
    },
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    articleSection: "المدونة",
    wordCount: post.content.replace(/<[^>]*>/g, "").split(/\s+/).length,
  };

  const parseTags = (tags: unknown): string[] => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
      try {
        return JSON.parse(tags);
      } catch {
        return [];
      }
    }
    return [];
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="container pt-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={ROUTES.BLOG} className="hover:text-primary transition-colors">
            المدونة
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium line-clamp-1">
            {post.title}
          </span>
        </nav>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            {/* Post Header */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                    {post.authorName?.charAt(0)}
                  </div>
                  <span className="font-medium text-foreground">
                    {post.authorName}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {post.publishedAt ? formatDate(post.publishedAt) : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {readingTime} دقائق قراءة
                </span>
                {post.viewCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.viewCount} مشاهدة
                  </span>
                )}
              </div>

            </header>

            {/* Featured Image */}
            {post.coverImage && (
              <figure className="mb-8">
                <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </figure>
            )}

            {/* Article Content */}
            <div
              id="article-content"
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:leading-relaxed prose-p:text-muted-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-muted prose-pre:rounded-lg
                prose-ul:space-y-1
                prose-li:text-muted-foreground
              "
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />

            {/* Post Footer */}
            <footer className="mt-12 pt-8 border-t">
              <TagsList tags={parseTags(post.tags)} />
              <div className="mt-6">
                <ShareButtons title={post.title} url={postUrl} />
              </div>
            </footer>

            {/* Author Bio */}
            <div className="mt-8">
              <AuthorBio authorName={post.authorName} />
            </div>

            {/* Related Tools */}
            <RelatedTools tags={parseTags(post.tags)} />

            {/* Related Posts */}
            <RelatedPosts currentSlug={slug} />
          </motion.article>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            {/* Most Read - Numbered List */}
            <MostRead currentSlug={slug} />

            {/* Newsletter Card */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-bold text-sm mb-3">اشترك في نشرتنا</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  احصل على أحدث المقالات مباشرة في بريدك
                </p>
                <Button className="w-full text-sm h-9">اشتراك</Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* FAQ Schema for Related Questions */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `ما هو ${post.title}؟`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: post.excerpt,
                },
              },
            ],
          }),
        }}
      />

      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "الرئيسية",
                item: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "المدونة",
                item: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/blog`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: postUrl,
              },
            ],
          }),
        }}
      />
    </>
  );
}

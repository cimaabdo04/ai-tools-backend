"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  Calendar,
  ArrowRight,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Skeleton } from "@components/ui/skeleton";
import { ROUTES } from "@lib/constants";
import { formatDate, cn } from "@lib/utils";
import { useBlogPosts, BlogPost } from "@hooks/use-blog";

// Popular blog categories for AI tools
const BLOG_CATEGORIES = [
  { slug: "all", label: "الكل", icon: "✨" },
  { slug: "reviews", label: "مراجعات", icon: "⭐" },
  { slug: "tutorials", label: "دروس", icon: "📚" },
  { slug: "news", label: "أخبار", icon: "📰" },
  { slug: "guides", label: "أدلة", icon: "🗺️" },
  { slug: "comparisons", label: "مقارنات", icon: "⚖️" },
];

// Reading time calculation
function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const textLength = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.ceil(textLength / wordsPerMinute);
}

// Featured Post Component
function FeaturedPost({ post }: { post: BlogPost }) {
  const t = useTranslations();
  const readingTime = getReadingTime(post.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 border"
    >
      <div className="grid md:grid-cols-2 gap-0">
        {post.coverImage && (
          <div className="relative h-64 md:h-auto overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
              <Sparkles className="h-3 w-3 ml-1" />
              مقال مميز
            </Badge>
          </div>
        )}
        <CardContent className="p-6 md:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {post.publishedAt ? formatDate(post.publishedAt) : ""}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readingTime} دقائق قراءة
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight hover:text-primary transition-colors">
            <Link href={`${ROUTES.BLOG}/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                {post.authorName?.charAt(0)}
              </div>
              {post.authorName}
            </span>
            <Button asChild className="gap-2">
              <Link href={`${ROUTES.BLOG}/${post.slug}`}>
                اقرأ المقال
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </motion.div>
  );
}

// Blog Card Component
function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const readingTime = getReadingTime(post.content);
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`${ROUTES.BLOG}/${post.slug}`}>
        <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 overflow-hidden">
          {post.coverImage && (
            <div className="relative aspect-video overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {post.tags && post.tags.length > 0 && (
                <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-xs">
                  {post.tags[0]}
                </Badge>
              )}
            </div>
          )}
          <CardContent className="p-5">
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {post.publishedAt ? formatDate(post.publishedAt) : ""}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readingTime} د
              </span>
            </div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-2 line-clamp-2 leading-snug">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                  {post.authorName?.charAt(0)}
                </div>
                {post.authorName}
              </span>
              <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                اقرأ
                <ArrowRight className={cn("h-3 w-3", isRtl && "rotate-180")} />
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

// Trending Posts Sidebar
function TrendingPosts({ posts }: { posts: BlogPost[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-bold text-sm mb-4">الأكثر قراءة</h3>
        <div className="space-y-3">
          {posts.slice(0, 5).map((post, index) => (
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
                <span className="text-xs text-muted-foreground mt-1 block">
                  {post.viewCount || 0} مشاهدة
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple Eye icon for view count
function Eye({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

export default function BlogPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCategories, setShowCategories] = useState(false);

  const { data, isLoading } = useBlogPosts({
    take: 12,
    locale,
    search: searchQuery || undefined,
  });

  const posts = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  // Get featured post (first post)
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);
  const trendingPosts = [...posts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

  return (
    <>
      {/* Page Header */}
      <div className="border-b">
        <div className="container py-8">
          <h1 className="text-3xl font-bold">المدونة</h1>
          <p className="text-muted-foreground mt-1">
            أحدث المقالات والمراجعات والدروس في عالم الذكاء الاصطناعي
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Posts Column */}
          <div className="lg:col-span-3 space-y-8">
            {/* Categories Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {BLOG_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors",
                    selectedCategory === cat.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Featured Post */}
            {featuredPost && !searchQuery && selectedCategory === "all" && (
              <FeaturedPost post={featuredPost} />
            )}

            {/* Posts Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-video rounded-none" />
                    <CardContent className="p-5 space-y-3">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : regularPosts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-bold mb-2">لا توجد مقالات</h2>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `لا توجد نتائج للبحث عن "${searchQuery}"`
                    : "لم يتم نشر مقالات في هذا التصنيف بعد"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regularPosts.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  السابق
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-9 h-9"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-muted-foreground">...</span>}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  التالي
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ابحث..."
                className="pr-9 h-10 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Most Read */}
            {trendingPosts.length > 0 && <TrendingPosts posts={trendingPosts} />}
          </aside>
        </div>
      </div>

      {/* Schema.org markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "مدونة دليل أدوات الذكاء الاصطناعي",
            description:
              "مقالات متعمقة، مراجعات شاملة، ودروس تعليمية عن أدوات الذكاء الاصطناعي",
            url: "https://aitoolsdirectory.com/blog",
            publisher: {
              "@type": "Organization",
              name: "Aiatlas",
              logo: {
                "@type": "ImageObject",
                url: "https://aitoolsdirectory.com/logo.png",
              },
            },
            blogPost: posts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              image: post.coverImage,
              datePublished: post.publishedAt,
              author: {
                "@type": "Person",
                name: post.authorName,
              },
              url: `https://aitoolsdirectory.com/blog/${post.slug}`,
            })),
          }),
        }}
      />
    </>
  );
}

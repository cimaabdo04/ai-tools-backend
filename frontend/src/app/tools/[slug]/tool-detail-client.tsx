"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import {
  ChevronRight,
  Star, ThumbsUp, ThumbsDown,
} from "lucide-react"
import {
  IconExternalLink, IconCoin, IconMessageChatbot, IconPlayerPlay,
  IconPhoto, IconInfoCircle, IconEdit, IconStar, IconMessageCircle,
  IconChevronDown, IconWorld, IconVersions,
} from "@tabler/icons-react"
import { Button } from "@components/ui/button"
import { Skeleton } from "@components/ui/skeleton"
import { BookmarkButton } from "@components/common/bookmark-button"
import { CompareButton } from "@components/common/compare-button"
import { useTool, useTools, normalizeTool, type Tool } from "@hooks/use-tools"
import { useBlogPosts } from "@hooks/use-blog"
import { useReviews, useCreateReview } from "@hooks/use-reviews"
import { useAuthStore } from "@stores/auth-store"
import { ROUTES, API_ENDPOINTS } from "@lib/constants"
import { formatDate, absoluteUrl } from "@lib/utils"
import { getFlagEmoji, getCountryName } from "@lib/countries"
import { ToolFeedback } from "@components/tools/tool-feedback"
import { AdSlot } from "@components/tools/ad-slot"
import { MetricsGrid } from "@components/tools/metrics-grid"
import { ProsCons } from "@components/tools/pros-cons"
import { UseCaseTags } from "@components/tools/use-case-tags"
import { StarPicker } from "@components/tools/star-picker"
import { ReviewCard } from "@components/tools/review-card"
import { PricingCards } from "@components/tools/pricing-cards"
import { ComparisonTable } from "@components/tools/comparison-table"
import { RatingSummary } from "@components/tools/rating-summary"

import { QaSection } from "@components/tools/qa-section"
import { AlternativesSection } from "@components/tools/alternatives-section"
import { CompactShareBox } from "@components/tools/share-box"
import { api } from "@lib/api"
import { useQuery } from "@tanstack/react-query"
import DOMPurify from "dompurify"
import "../../../components/tools/tool-page.css"

const pricingLabels: Record<string, string> = {
  free: "toolPricing.free",
  freemium: "toolPricing.freemium",
  paid: "toolPricing.paid",
  contact: "toolPricing.contact",
}

function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "ul", "ol", "li", "br", "img", "h2", "h3", "h4", "blockquote", "pre", "code"],
    ALLOWED_ATTR: ["href", "src", "alt", "class", "target", "rel"],
  })
}

function strip(html: string) {
  return html?.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim() || ""
}

interface Props {
  initialData: any
  slug: string
  locale: string
}

export function ToolDetailClient({ initialData, slug, locale }: Props) {
  const tr = useTranslations()
  const isRtl = locale === "ar"

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ title: "", content: "", rating: 0 })
  const [reviewPros, setReviewPros] = useState("")
  const [reviewCons, setReviewCons] = useState("")
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [showAllAlt, setShowAllAlt] = useState(false)

  const { data, isLoading, isError } = useTool(slug)
  const normalizedInitial = initialData
    ? (() => {
        const {
          id, name, slug: s, description, websiteUrl, logoUrl, screenshotUrl, videoUrl,
          pricingTypes, pricingMin, pricingMax, averageRating, reviewCount, viewCount,
          categories, tags, features, platforms, createdAt, pros, cons,
          useCases, targetAudience, ratingDistribution,
          twitterUrl, githubUrl, discordUrl,
          faqs, badge, highlight, stats, models, gallery,
          alternativesText, pricingDetails, alternativeSlugs, startSteps, conclusion,
        } = initialData
        return {
          id, name, slug: s, description, websiteUrl, logoUrl, screenshotUrl, videoUrl,
          pricingTypes, pricingMin, pricingMax, averageRating, reviewCount, viewCount,
          categories, tags, features, platforms, createdAt, pros, cons,
          useCases, targetAudience, ratingDistribution,
          twitterUrl, githubUrl, discordUrl,
          faqs, badge, highlight, stats, models, gallery,
          alternativesText, pricingDetails, alternativeSlugs, startSteps, conclusion,
          tagline: initialData.tagline || "",
        }
      })()
    : null
  const tool = data?.data ?? normalizedInitial

  const { data: similarData } = useTools({
    categoryId: tool?.categories?.[0]?.id || undefined,
    sort: "popular",
    perPage: 100,
  })
  const alternativeSlugsArr = (() => {
    try { return JSON.parse(tool?.alternativeSlugs || "[]") } catch { return [] }
  })() as string[]
  const similarToolsAll =
    similarData?.data?.filter((st: any) => st.id !== tool?.id) ?? []
  const missingAltSlugs = useMemo(() => {
    if (!alternativeSlugsArr.length) return []
    return alternativeSlugsArr.filter((s) => !similarToolsAll.some((st) => st.slug === s))
  }, [alternativeSlugsArr, similarToolsAll])
  const { data: fetchedAltTools = [] } = useQuery({
    queryKey: ["tools", "alt-slugs", ...missingAltSlugs],
    queryFn: async () => {
      const results = await Promise.all(
        missingAltSlugs.map((slug) =>
          api.get<{ data: Tool }>(API_ENDPOINTS.TOOLS.DETAIL(slug))
            .then((r) => normalizeTool(r.data))
            .catch(() => null)
        )
      )
      return results.filter(Boolean) as Tool[]
    },
    enabled: missingAltSlugs.length > 0,
    staleTime: 1000 * 60 * 5,
  })
  const allAltTools = [...similarToolsAll, ...fetchedAltTools]
  const matchedSlugs =
    alternativeSlugsArr.length > 0
      ? alternativeSlugsArr.filter((s) =>
          allAltTools.some((st: any) => st.slug === s)
        )
      : allAltTools.map((st: any) => st.slug)
  const totalAltCount = matchedSlugs.length
  const similarTools = (
    alternativeSlugsArr.length > 0
      ? alternativeSlugsArr
          .map((s: string) => allAltTools.find((st: any) => st.slug === s))
          .filter(Boolean)
      : allAltTools
  ).slice(0, showAllAlt ? 12 : 4) as Tool[]

  const { data: latestToolsData } = useTools({ sort: "newest", perPage: 5 })
  const { data: popularToolsData } = useTools({ sort: "popular", perPage: 5 })
  const latestTools = latestToolsData?.data ?? []
  const popularTools = popularToolsData?.data ?? []
  const { data: blogData } = useBlogPosts({ take: 5 })
  const blogPosts = blogData?.data ?? []

  const { data: reviewsData } = useReviews(tool?.id ?? "")
  const createReview = useCreateReview()
  const reviews = reviewsData?.data ?? []
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const handleSubmitReview = useCallback(async () => {
    if (!tool?.id || !reviewForm.title || !reviewForm.content) return
    await createReview.mutateAsync({
      toolId: tool.id,
      title: reviewForm.title,
      content: reviewForm.content,
      rating: reviewForm.rating,
      pros: reviewPros
        ? reviewPros.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      cons: reviewCons
        ? reviewCons.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
    })
    setReviewForm({ title: "", content: "", rating: 0 })
    setReviewPros("")
    setReviewCons("")
    setShowReviewForm(false)
  }, [tool?.id, reviewForm, reviewPros, reviewCons, createReview])

  const showLoading = isLoading && !tool

  if (showLoading) {
    return (
      <div className="container py-8 space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError && !tool) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold">{tr("errors.notFound")}</h2>
        <p className="text-muted-foreground mt-2">{tr("errors.notFoundMessage")}</p>
        <Button asChild className="mt-6">
          <Link href={ROUTES.TOOLS}>{tr("common.back")}</Link>
        </Button>
      </div>
    )
  }

  const t = tool as any
  const pricingTypes = (() => {
    const raw = t.pricingTypes
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    if (typeof raw === "string") {
      try { return JSON.parse(raw) } catch { return raw.split(/[,;，；\s]+/).filter(Boolean) }
    }
    return []
  })()
  const parseJson = (val: any, fallback: any) => {
    if (!val) return fallback
    try { return typeof val === "string" ? JSON.parse(val) : val }
    catch { return fallback }
  }
  const statsData = parseJson(t.stats, {})
  const modelsData = parseJson(t.models, [])
  const galleryData = parseJson(t.gallery, [])
  const pricingDetailsData = parseJson(t.pricingDetails, {})
  const startStepsArr = parseJson(t.startSteps, [])
  const releasesData = parseJson(t.releases, [])
  const parseArray = (val: any): string[] => {
    if (!val) return []
    if (Array.isArray(val)) return val.map((v: any) => typeof v === "string" ? v : v.name || v.tag?.name || "").filter(Boolean)
    if (typeof val === "string") {
      try { return JSON.parse(val).map((v: any) => typeof v === "string" ? v : v.name || v.tag?.name || "").filter(Boolean) }
      catch { return val.split(/[,;，；\s]+/).filter(Boolean) }
    }
    return []
  }
  const prosList = parseArray(t.pros)
  const consList = parseArray(t.cons)
  const featuresList = parseArray(t.features)
  const useCasesList = parseArray(t.useCases)
  const tagList = parseArray(t.tags)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t.name,
    description: strip(t.description),
    url: t.websiteUrl,
    ...(t.logoUrl && { image: t.logoUrl }),
    ...((t.categories?.[0]?.name) && { applicationCategory: t.categories[0].name }),
    ...(pricingTypes.length > 0 && {
      offers: { "@type": "Offer", price: t.pricingMin ?? 0, priceCurrency: "USD" },
    }),
    ...((t.averageRating ?? 0) > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: t.averageRating,
        reviewCount: t.reviewCount ?? 0,
      },
    }),
  }

  const faqEntries = (t.faqs?.length ? t.faqs : []).map((f: any) => ({
    question: f.question,
    answer: f.answer,
  }))
  const faqJsonLd =
    faqEntries.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqEntries.map((f: any) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: tr("home.hero.title"),
        item: absoluteUrl(""),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tr("tools.title"),
        item: absoluteUrl(ROUTES.TOOLS),
      },
      { "@type": "ListItem", position: 3, name: t.name },
    ],
  }

  const ratingDist = t.ratingDistribution ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const totalRatings = (Object.values(ratingDist) as number[]).reduce(
    (a, b) => a + b,
    0
  )

  const hasVideo = !!t.videoUrl
  const videoEmbedUrl = hasVideo
    ? (() => {
        const m = t.videoUrl?.match(
          /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        )
        return m ? `https://www.youtube.com/embed/${m[1]}` : t.videoUrl
      })()
    : ""

  const statEntries = Object.entries(statsData) as [string, string][]
  const allTags = [...useCasesList, ...tagList]
  const isNew =
    t.createdAt &&
    Date.now() - new Date(t.createdAt).getTime() < 30 * 86400000

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        )}

        {/* Breadcrumb */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#a0a8e0",
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <Link
            href={ROUTES.HOME}
            style={{ color: "hsl(var(--muted-foreground))", textDecoration: "none" }}
          >
            {tr("nav.home")}
          </Link>
          <ChevronRight
            size={16}
            style={{ transform: isRtl ? "rotate(180deg)" : "none", color: "hsl(var(--muted-foreground))" }}
          />
          <Link
            href={ROUTES.TOOLS}
            style={{ color: "hsl(var(--muted-foreground))", textDecoration: "none" }}
          >
            {tr("tools.title")}
          </Link>
          <ChevronRight
            size={16}
            style={{ transform: isRtl ? "rotate(180deg)" : "none", color: "hsl(var(--muted-foreground))" }}
          />
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {t.name}
          </span>
        </nav>

          {/* ══════ PAGE CONTAINER ══════ */}
          <div style={{ position: "relative", overflow: "hidden" }}>

            {/* Ambient glow */}
            <div className="tp-glow tp-glow-1" />
            <div className="tp-glow tp-glow-2" />

            {/* LEADERBOARD AD */}
            <AdSlot height="72px" label="Leaderboard Banner — 728×90" />

            <div className="tp">

            {/* SPLIT LAYOUT */}
            <div className="tp-split">

              {/* ═══ MAIN CONTENT ═══ */}
              <div className="tp-main">

          {/* ═══ HERO — Tool Identity ═══ */}
          <div style={{ marginBottom: 28 }}>
            {/* Logo + Name + Tagline */}
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
              <div className="tp-hero-logo">
                {t.logoUrl ? (
                  <Image src={t.logoUrl} alt={t.name} width={48} height={48} style={{ borderRadius: 12, objectFit: "contain" }} />
                ) : (
                  t.name?.charAt(0)
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 className="tp-hero-name">{t.name?.replace(/[-–].*/g, "").trim() || t.name}</h1>
                {t.tagline && <p style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", marginTop: 4 }}>{t.tagline}</p>}
              </div>
            </div>

            {/* Meta — Stats + Badges */}
            <div className="tp-hero-meta">
              <div className="tp-hero-stats">
                <div className="tp-hero-stat">
                  <span className="tp-hero-stat-value">{(t.averageRating ?? 0).toFixed(1)}</span>
                  <span className="tp-hero-stat-label">التقييم</span>
                </div>
                <div className="tp-hero-stat">
                  <span className="tp-hero-stat-value">{t.reviewCount ?? 0}</span>
                  <span className="tp-hero-stat-label">التقييمات</span>
                </div>
                <div className="tp-hero-stat">
                  <span className="tp-hero-stat-value">{t.viewCount ?? 0}</span>
                  <span className="tp-hero-stat-label">المشاهدات</span>
                </div>
                <div className="tp-hero-stat">
                  <span className="tp-hero-stat-value">{t.bookmarkCount ?? 0}</span>
                  <span className="tp-hero-stat-label">الإشارات</span>
                </div>
              </div>
              <div className="tp-hero-badges">
                {pricingTypes.some((p: string) => p?.toLowerCase() === "free") && <span className="badge b-free">💰 مجاني</span>}
                {t.categories?.[0]?.name && <span className="badge b-cat">💬 {t.categories[0].name}</span>}
                {isNew && <span className="badge b-new">⭐ جديد</span>}
                {t.country && <span className="badge b-cat">{getFlagEmoji(t.country)} {getCountryName(t.country)}</span>}
                {t.version && <span className="badge b-cat">{t.version}</span>}
              </div>
            </div>

            {/* Info Grid — Metrics */}
            <div className="tp-info-grid">
              {statEntries.map((entry: any, i: number) => (
                <div key={i} className="metric">
                  <div className="metric-val">{entry.value ?? "-"}</div>
                  <div className="metric-lbl">{entry.label ?? ""}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a href={t.websiteUrl} target="_blank" rel="noopener noreferrer" className="tp-cta-btn">
              <IconExternalLink size={16} /> زيارة الأداة
            </a>

            {/* Actions */}
            <div className="tp-hero-actions">
              <BookmarkButton toolId={t.id} className="btn tp-action-btn" />
              <CompareButton toolId={t.id} toolName={t.name} className="btn tp-action-btn" />
            </div>

            {/* GitHub */}
            {t.githubUrl && (
              <a href={t.githubUrl} target="_blank" rel="noopener noreferrer" className="tp-hero-github" style={{ marginTop: 12 }}>
                🔗 GitHub
              </a>
            )}
          </div>

          {/* 3. METRICS */}
          <MetricsGrid entries={statEntries} />

          {/* 4. VIDEO */}
          {hasVideo && (
            <>
              <h2 className="sec-title">
                <i><IconPlayerPlay size={16} /></i> فيديو تعريفي
              </h2>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  maxHeight: 450,
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#0a0f2c",
                  border: "1px solid rgba(255,255,255,0.08)",
                  marginBottom: 10,
                }}
              >
                <iframe
                  src={videoEmbedUrl}
                  title={t.name}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </>

          )}

          {/* 5. GALLERY */}
          {galleryData.length > 0 && (
            <>
              <h2 className="sec-title">
                <i><IconPhoto size={16} /></i> صور الأداة
              </h2>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  maxHeight: 400,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                  overflow: "hidden",
                }}
              >
                {galleryData[galleryIdx] ? (
                  <img
                    src={galleryData[galleryIdx]}
                    alt={`${t.name} screenshot`}
                    style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 12 }}
                  />
                ) : (
                  <i><IconPhoto size={32} style={{ color: "#334155" }} /></i>
                )}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(galleryData.length, 4)}, 1fr)`,
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                {galleryData.slice(0, 4).map((_: string, i: number) => (
                  <div
                    key={i}
                    className={`thumb ${i === galleryIdx ? "active" : ""}`}
                    style={{ height: 50 }}
                    onClick={() => setGalleryIdx(i)}
                  >
                    <i><IconPhoto size={16} style={{ color: i === galleryIdx ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} /></i>
                  </div>
                ))}
              </div>
            </>

          )}

          {/* 7. WHAT IS */}

            <h2 className="sec-title">
              <i><IconInfoCircle size={16} /></i> ما هو {t.name}؟
            </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: "hsl(var(--muted-foreground))",
              marginBottom: 10,
            }}
          >
            {t.description
              ? strip(t.description).slice(0, 200)
              : ""}
          </p>
          {t.highlight && (
            <div className="hlight">
              <p>{t.highlight}</p>
            </div>
          )}
          {t.description && (
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.85,
                color: "hsl(var(--muted-foreground))",
                marginBottom: 14,
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(t.description) }}
            />
          )}



          {/* 8. PROS / CONS + USE CASES */}

            <h2 className="sec-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              المميزات والعيوب
            </h2>
            <div className="tp">
              <ProsCons pros={prosList} cons={consList} />
              <UseCaseTags tags={allTags} />
            </div>


          {/* FEATURES */}
          {featuresList.length > 0 && (
            <>
              <h2 className="sec-title">
                <i><IconInfoCircle size={16} /></i> المميزات
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 6,
                  marginBottom: 14,
                }}
              >
                {featuresList.map((f: string, i: number) => (
                  <div
                    key={i}
                    className="pro-con"
                    style={{ margin: 0 }}
                  >
                    <i><IconInfoCircle size={13} style={{ color: "hsl(var(--primary))" }} /></i>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </>

          )}

          {/* MODELS */}
          {modelsData.length > 0 && (
            <>
              <h2 className="sec-title">
                <i><IconInfoCircle size={16} /></i> النماذج
              </h2>
              {modelsData.map((model: any, idx: number) => (
                <div
                  key={idx}
                  className="card"
                  style={{ marginBottom: 8 }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                       color: "hsl(var(--foreground))",
                      marginBottom: 4,
                    }}
                  >
                    {model.name || `نموذج ${idx + 1}`}
                  </div>
                  {model.audience?.length > 0 && (
                    <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 2 }}>
                      <strong>الجمهور المستهدف:</strong> {model.audience.join("، ")}
                    </p>
                  )}
                  {model.specs && (
                    <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 2 }}>
                      <strong>المواصفات:</strong> {model.specs}
                    </p>
                  )}
                  {model.useCases?.length > 0 && (
                    <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                      <strong>الاستخدامات:</strong> {model.useCases.join("، ")}
                    </p>
                  )}
                </div>
              ))}
            </>

          )}

          {/* RELEASES */}
          {releasesData.length > 0 && (
            <>
              <h2 className="sec-title">
                <i><IconVersions size={16} /></i> الإصدارات
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {releasesData.map((rel: any, idx: number) => (
                  <div key={idx} className="card" style={{ display: "flex", gap: 12, padding: "12px 14px" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "hsl(var(--muted) / 0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {t.logoUrl ? (
                        <Image src={t.logoUrl} alt="" width={20} height={20} style={{ borderRadius: 4 }} />
                      ) : (
                        <IconVersions size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "hsl(var(--foreground))" }}>
                          {rel.version || `الإصدار ${idx + 1}`}
                        </span>
                        {rel.date && (
                          <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                            {rel.date}
                          </span>
                        )}
                      </div>
                      {rel.description && (
                        <p style={{ fontSize: 12, lineHeight: 1.7, color: "hsl(var(--muted-foreground))", marginTop: 4, whiteSpace: "pre-line" }}>
                          {rel.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>

          )}

          {/* 10. PRICING */}

            <PricingCards
              pricingTypes={pricingTypes}
              pricingMin={t.pricingMin}
              pricingMax={t.pricingMax}
            />


          {/* START STEPS */}
          {startStepsArr.length > 0 && (
            <>
              <h2 className="sec-title">
                <i><IconInfoCircle size={16} /></i> كيف تبدأ؟
              </h2>
              <div style={{ marginBottom: 14 }}>
                {startStepsArr.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="card"
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      marginBottom: 8,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "hsl(var(--foreground))",
                          marginBottom: 2,
                        }}
                      >
                        {step.title || ""}
                      </div>
                      <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
                        {step.desc || ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>

          )}

          {/* ALTERNATIVES */}

            <AlternativesSection
            alternatives={similarTools}
            totalCount={totalAltCount}
            showAll={showAllAlt}
            onToggle={() => setShowAllAlt((v) => !v)}
          />


          {/* CONCLUSION */}
          {t.conclusion && (
            <>
              <h2 className="sec-title">
                <i><IconInfoCircle size={16} /></i> الخلاصة
              </h2>
              <div
                className="hlight"
                style={{ marginBottom: 14 }}
              >
                <p style={{ color: "hsl(var(--primary) / 0.8)", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                  {t.conclusion}
                </p>
              </div>
            </>

          )}

          {/* 13. RATING SUMMARY */}
          <RatingSummary
            averageRating={t.averageRating ?? 0}
            reviewCount={t.reviewCount ?? 0}
            ratingDistribution={ratingDist}
          />

          {/* — Reviews — */}

            <h2 className="sec-title">
              <i><IconMessageCircle size={16} /></i> آراء المستخدمين
            <span
              style={{
                marginInlineStart: "auto",
                fontSize: 11,
                color: "hsl(var(--muted-foreground))",
                fontWeight: 400,
              }}
            >
              الأحدث أولاً
            </span>
          </h2>

          {reviews.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                fontSize: 14,
                color: "hsl(var(--muted-foreground))",
                marginBottom: 20,
              }}
            >
              لا توجد تقييمات بعد. كن أول من يقيم!
            </p>
          ) : (
            reviews.map((review: any) => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}

          {reviews.length > 3 && (
            <button
              style={{
                width: "100%",
                background: "hsl(var(--muted) / 0.3)",
                border: "1px solid hsl(var(--border) / 0.3)",
                color: "hsl(var(--muted-foreground))",
                borderRadius: 8,
                padding: 9,
                fontSize: 12,
                cursor: "pointer",
                marginBottom: 4,
              }}
            >
              عرض جميع التقييمات ({t.reviewCount ?? 0}){" "}
              <i><IconChevronDown size={12} style={{ display: "inline", verticalAlign: "middle" }} /></i>
            </button>
          )}



          {/* 14. WRITE REVIEW */}

            <h2 className="sec-title">
              <i><IconEdit size={16} /></i> اكتب تقييمك
          </h2>
          <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
            {!showReviewForm ? (
              isAuthenticated ? (
                <button
                  className="submit-btn"
                  onClick={() => setShowReviewForm(true)}
                >
                  اكتب تقييمك
                </button>
              ) : (
                <Link
                  href={ROUTES.LOGIN}
                  className="submit-btn"
                  style={{ textDecoration: "none", display: "inline-block" }}
                >
                  سجل الدخول لتقييم
                </Link>
              )
            ) : (
              <div>
                <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 7 }}>
                  تقييمك بالنجوم
                </div>
                <StarPicker
                  value={reviewForm.rating}
                  onChange={(v) =>
                    setReviewForm((f) => ({ ...f, rating: v }))
                  }
                />
                <div style={{ marginTop: 12 }}>
                  <input
                    className="fake-input"
                    style={{ marginBottom: 9 }}
                    placeholder="عنوان التقييم"
                    value={reviewForm.title}
                    onChange={(e) =>
                      setReviewForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                  <textarea
                    className="fake-input"
                    style={{ height: 72, marginBottom: 9, resize: "vertical" }}
                    placeholder="اكتب تجربتك مع الأداة..."
                    value={reviewForm.content}
                    onChange={(e) =>
                      setReviewForm((f) => ({ ...f, content: e.target.value }))
                    }
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginBottom: 9,
                    }}
                  >
                    <input
                      className="fake-input"
                      placeholder="الإيجابيات (مفصولة بفواصل)"
                      value={reviewPros}
                      onChange={(e) => setReviewPros(e.target.value)}
                    />
                    <input
                      className="fake-input"
                      placeholder="السلبيات (مفصولة بفواصل)"
                      value={reviewCons}
                      onChange={(e) => setReviewCons(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="submit-btn"
                      onClick={handleSubmitReview}
                      disabled={
                        createReview.isPending ||
                        !reviewForm.title ||
                        !reviewForm.content
                      }
                    >
                      {createReview.isPending ? "جاري الإرسال..." : "نشر التقييم"}
                    </button>
                    <button
                      className="submit-btn"
                      style={{ background: "transparent", border: "1px solid hsl(var(--border) / 0.3)", color: "hsl(var(--muted-foreground))" }}
                      onClick={() => setShowReviewForm(false)}
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* 15. Q&A */}

            <QaSection faqs={faqEntries} />


          {/* 18. FOOTER AD */}
          <div style={{ marginTop: 18 }}>
            <AdSlot
              height="64px"
              label="Responsive Banner — 728×90 كمبيوتر | 320×50 موبايل"
            />
          </div>

            </div>{/* /tp-main */}

            {/* ═══ SIDEBAR (30%) — Ad + Widgets + Share ═══ */}
            <aside className="tp-sidebar">
              <AdSlot height="250px" label="Medium Rectangle — 300×250" />

              <div className="sidebar-widget">
                <div className="sidebar-widget-title">أحدث الأدوات</div>
                <div className="sidebar-widget-list">
                  {latestTools.slice(0, 5).map((item: Tool) => (
                    <Link key={item.id} href={ROUTES.TOOL_DETAIL(item.slug)} className="sidebar-widget-item">
                      <div className="sidebar-widget-logo">
                        {item.logoUrl ? (
                          <Image src={item.logoUrl} alt={item.name} width={32} height={32} style={{ objectFit: "contain", borderRadius: 6 }} />
                        ) : (
                          item.name?.charAt(0)
                        )}
                      </div>
                      <span className="sidebar-widget-name">{item.name}</span>
                      <span className="sidebar-widget-rating">{(item.averageRating ?? 0).toFixed(1)}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="sidebar-widget">
                <div className="sidebar-widget-title">الأكثر مشاهدة</div>
                <div className="sidebar-widget-list">
                  {popularTools.slice(0, 5).map((item: Tool) => (
                    <Link key={item.id} href={ROUTES.TOOL_DETAIL(item.slug)} className="sidebar-widget-item">
                      <div className="sidebar-widget-logo">
                        {item.logoUrl ? (
                          <Image src={item.logoUrl} alt={item.name} width={32} height={32} style={{ objectFit: "contain", borderRadius: 6 }} />
                        ) : (
                          item.name?.charAt(0)
                        )}
                      </div>
                      <span className="sidebar-widget-name">{item.name}</span>
                      <span className="sidebar-widget-rating">{(item.averageRating ?? 0).toFixed(1)}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="sidebar-widget">
                <div className="sidebar-widget-title">أحدث المقالات</div>
                <div className="sidebar-widget-list">
                  {blogPosts.slice(0, 5).map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="sidebar-widget-item">
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                        <span className="sidebar-widget-name">{post.title}</span>
                        <span style={{ fontSize: 11, color: "hsl(215 16% 55%)" }}>
                          {post.publishedAt ? formatDate(post.publishedAt, "MM/dd/yyyy") : ""}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <CompactShareBox toolName={t.name} slug={slug} />
            </aside>

          </div>{/* /tp-split */}
          </div>{/* /tp */}
        </div>{/* /container */}
      </div>
    </div>
  )
}

function renderStars(rating: number) {
  const full = Math.round(rating)
  let s = ""
  for (let i = 0; i < 5; i++) s += i < full ? "★" : "☆"
  return s
}

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { IconApps, IconChevronDown } from "@tabler/icons-react"
import { ROUTES } from "@lib/constants"
import type { Tool } from "@hooks/use-tools"

interface AlternativesSectionProps {
  alternatives: Tool[]
  totalCount: number
  showAll: boolean
  onToggle: () => void
}

const filterOptions = [
  { label: "الكل", key: "all" },
  { label: "مجاني", key: "free" },
  { label: "محادثة AI", key: "chat" },
  { label: "برمجة", key: "coding" },
]

function renderStars(rating: number) {
  let s = ""
  for (let i = 0; i < 5; i++) s += i < Math.round(rating) ? "★" : "☆"
  return s
}

function getPricingLabel(t: any): string {
  try {
    const types = JSON.parse(t.pricingTypes || "[]")
    if (types.some((p: string) => p?.toLowerCase() === "free")) return "مجاني"
    if (types.some((p: string) => p?.toLowerCase() === "freemium")) return "مدفوع جزئياً"
    return "مدفوع"
  } catch {
    return ""
  }
}

function getPricingBadgeClass(label: string) {
  if (label === "مجاني") return "b-free"
  return "b-paid"
}

function getCategory(t: any): string {
  return t.categories?.[0]?.name || ""
}

export function AlternativesSection({ alternatives, totalCount, showAll, onToggle }: AlternativesSectionProps) {
  const [filter, setFilter] = useState("all")

  const filtered = useMemo(() => {
    if (filter === "all") return alternatives
    return alternatives.filter((a: any) => {
      const p = getPricingLabel(a)
      const cat = getCategory(a).toLowerCase()
      if (filter === "free") return p === "مجاني"
      if (filter === "chat") return cat.includes("محادثة") || cat.includes("chat")
      if (filter === "coding") return cat.includes("برمجة") || cat.includes("كود") || cat.includes("program")
      return true
    })
  }, [alternatives, filter])

  if (!alternatives.length) return null

  return (
    <>
      <h2 className="sec-title">
        <i><IconApps size={16} /></i> بدائل {alternatives[0]?.name || "الأداة"}
        <span style={{ marginRight: "auto", fontSize: 11, color: "#475569", fontWeight: 400 }}>مرتّبة بالأفضل</span>
      </h2>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            style={{
              fontSize: 11, padding: "4px 12px", borderRadius: 99,
              background: filter === opt.key ? "#1d4ed8" : "rgba(255,255,255,0.04)",
              color: filter === opt.key ? "#bfdbfe" : "#64748b",
              border: filter === opt.key ? "none" : "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {filtered.map((alt: any) => {
          const pricing = getPricingLabel(alt)
          const cat = getCategory(alt)
          return (
            <Link key={alt.id} href={ROUTES.TOOL_DETAIL(alt.slug)} className="alt-card" style={{ textDecoration: "none" }}>
              <div>
                {alt.logoUrl ? (
                  <Image src={alt.logoUrl} alt={alt.name} width={40} height={40} className="alt-logo" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="alt-logo" style={{ background: "#334155" }}>{alt.name?.charAt(0)}</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 3 }}>
                  <span className="alt-name">{alt.name}</span>
                  {pricing && <span className={`badge ${getPricingBadgeClass(pricing)}`}>{pricing}</span>}
                  {cat && <span className="badge b-cat">{cat}</span>}
                </div>
                <p className="alt-desc">{alt.description?.slice(0, 100)}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="alt-stars">{renderStars(alt.averageRating || 0)}</span>
                  <span className="alt-rating">{(alt.averageRating || 0).toFixed(1)} · {alt.reviewCount ?? 0} تقييم</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      {totalCount > 4 && (
        <button
          onClick={onToggle}
          style={{
            width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#64748b", borderRadius: 8, padding: 9, fontSize: 12, cursor: "pointer",
          }}
        >
          {showAll ? "عرض أقل" : `عرض كل البدائل (${totalCount} أداة)`} <IconChevronDown size={12} style={{ display: "inline", verticalAlign: "middle" }} />
        </button>
      )}
    </>
  )
}


import { IconArrowsExchange } from "@tabler/icons-react"
import type { Tool } from "@hooks/use-tools"

interface ComparisonTableProps {
  tool: any
  alternatives: Tool[]
}

const features_ = [
  { key: "price", label: "السعر المجاني", getVal: (t: any) => (() => { try { return JSON.parse(t.pricingTypes || '[]'); } catch { return []; } })().some((p: string) => p?.toLowerCase() === "free") ? "مجاني" : "مدفوع" },
  { key: "rating", label: "التقييم", getVal: (t: any) => t.averageRating != null ? `${t.averageRating.toFixed(1)} ★` : "—" },
  { key: "reviews", label: "عدد التقييمات", getVal: (t: any) => t.reviewCount ?? 0 },
]

export function ComparisonTable({ tool, alternatives }: ComparisonTableProps) {
  const others = alternatives.slice(0, 3)
  if (!others.length) return null

  const cols = [tool, ...others]

  return (
    <>
      <div className="sec-title"><i><IconArrowsExchange size={16} /></i> مقارنة سريعة</div>
      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "4px 12px", marginBottom: 6 }}>
        <div className="cr-row">
          <span style={{ color: "#475569" }}>الميزة</span>
          {cols.map((c, i) => (
            <span key={i} style={{ fontSize: 11, color: i === 0 ? "#38bdf8" : "#64748b", fontWeight: i === 0 ? 500 : 400 }}>
              {c.name}
            </span>
          ))}
        </div>
        {features_.map((f) => (
          <div className="cr-row" key={f.key}>
            <span style={{ color: "#64748b" }}>{f.label}</span>
            {cols.map((c, i) => {
              const val = f.getVal(c)
              const isBest = i === 0 || (() => { const first = f.getVal(cols[0]); return val === first })()
              return (
                <span key={i} className={i === 0 && isBest ? "good" : isBest ? "good" : "mid"} style={{ fontSize: 11 }}>
                  {String(val)}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}

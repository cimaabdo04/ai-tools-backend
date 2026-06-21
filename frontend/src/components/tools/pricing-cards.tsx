import { IconCheck, IconCreditCard } from "@tabler/icons-react"

interface PricingCardsProps {
  pricingTypes: string[]
  pricingMin?: number | null
  pricingMax?: number | null
}

export function PricingCards({ pricingTypes, pricingMin, pricingMax }: PricingCardsProps) {
  if (!pricingTypes.length) return null

  const isFree = pricingTypes.some((p) => p?.toLowerCase() === "free")
  const hasPaid = pricingTypes.some((p) => p?.toLowerCase() === "paid" || p?.toLowerCase() === "freemium")

  return (
    <>
      <div className="sec-title"><i><IconCreditCard size={16} /></i> الأسعار والخطط</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
        {(isFree || !hasPaid) && (
          <div className="plan-card">
            <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", marginBottom: 4 }}>مجاني</div>
            <div style={{ fontSize: 19, fontWeight: 500, color: "#4ade80", marginBottom: 8 }}>
              {pricingMin != null ? `$${pricingMin}` : "$0"}
              <span style={{ fontSize: 11, color: "#475569" }}> / شهر</span>
            </div>
            <div className="pro-con"><i><IconCheck size={13} style={{ color: "#4ade80" }} /></i><span>استخدام أساسي مجاني</span></div>
            <div className="pro-con"><i><IconCheck size={13} style={{ color: "#4ade80" }} /></i><span>مميزات محدودة</span></div>
          </div>
        )}
        {hasPaid && (
          <div className="plan-card featured">
            <div style={{ marginBottom: 5 }}><span className="badge b-cat" style={{ fontSize: 10 }}>الأكثر شيوعاً</span></div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", marginBottom: 4 }}>مدفوع</div>
            <div style={{ fontSize: 19, fontWeight: 500, color: "#38bdf8", marginBottom: 8 }}>
              {pricingMax != null ? `$${pricingMax}` : "$--"}
              <span style={{ fontSize: 11, color: "#475569" }}> / شهر</span>
            </div>
            <div className="pro-con"><i><IconCheck size={13} style={{ color: "#4ade80" }} /></i><span>جميع المميزات</span></div>
            <div className="pro-con"><i><IconCheck size={13} style={{ color: "#4ade80" }} /></i><span>دعم متميز وأولوية</span></div>
          </div>
        )}
      </div>
    </>
  )
}

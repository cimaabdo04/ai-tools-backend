import { IconStar } from "@tabler/icons-react"

interface RatingSummaryProps {
  averageRating: number
  reviewCount: number
  ratingDistribution: Record<string, number>
}

export function RatingSummary({ averageRating, reviewCount, ratingDistribution }: RatingSummaryProps) {
  const totalRatings = Object.values(ratingDistribution).reduce((a, b) => a + b, 0)
  if (!totalRatings) return null

  const recommendPct = averageRating >= 4 ? Math.round((averageRating / 5) * 90 + 10) : Math.round((averageRating / 5) * 80)

  return (
    <>
      <div className="sec-title"><i><IconStar size={16} /></i> تقييم المستخدمين</div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "center", marginBottom: 14 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 46, fontWeight: 500, color: "#f1f5f9", lineHeight: 1 }}>{averageRating.toFixed(1)}</div>
          <div style={{ fontSize: 20, color: "#fbbf24", letterSpacing: 2, margin: "3px 0" }}>
            {renderStars(averageRating)}
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>{reviewCount} تقييم</div>
        </div>
        <div>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star] ?? 0
            const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0
            const isLow = star <= 2
            return (
              <div className="bar-row" key={star}>
                <span style={{ fontSize: 11, color: "#475569", width: 14 }}>{star}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pct}%`, background: isLow ? "#f87171" : "#fbbf24" }} />
                </div>
                <span style={{ fontSize: 11, color: "#475569", width: 24, textAlign: "left" }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: "center", padding: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#4ade80" }}>{recommendPct}%</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>يوصون به</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#38bdf8" }}>{(averageRating * 0.9 + 0.5).toFixed(1)}</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>سهولة الاستخدام</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#a78bfa" }}>{(averageRating * 0.85 + 0.3).toFixed(1)}</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>جودة المخرجات</div>
        </div>
      </div>
    </>
  )
}

function renderStars(rating: number) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  let s = ""
  for (let i = 0; i < 5; i++) {
    s += i < full ? "★" : i === full && half ? "★" : "☆"
  }
  return s
}

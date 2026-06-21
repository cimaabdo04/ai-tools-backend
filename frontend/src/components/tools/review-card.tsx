import React, { useState } from "react"
import { IconCheck, IconThumbUp, IconThumbDown } from "@tabler/icons-react"

interface ReviewCardProps {
  review: any
  onHelpful?: (id: string, type: "up" | "down") => void
}

const colors = [
  "rgba(99,102,241,0.2)", "rgba(56,189,248,0.2)", "rgba(251,191,36,0.2)",
  "rgba(74,222,128,0.2)", "rgba(248,113,113,0.2)", "rgba(168,85,247,0.2)",
]
const textColors = ["#a78bfa", "#38bdf8", "#fbbf24", "#4ade80", "#f87171", "#c084fc"]

function renderStars(rating: number) {
  let s = ""
  for (let i = 0; i < 5; i++) s += i < rating ? "★" : "☆"
  return s
}

export function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  const initial = (review.user?.name ?? review.user?.username ?? "م").charAt(0)
  const colorIdx = (review.user?.name?.length ?? 0) % colors.length
  const [upCount, setUpCount] = useState(review.helpfulCount ?? 0)
  const [dnCount, setDnCount] = useState(review.notHelpfulCount ?? 0)
  const [voted, setVoted] = useState<string | null>(null)

  return (
    <div className="review-card">
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
        <div className="avatar" style={{ background: colors[colorIdx], color: textColors[colorIdx] }}>{initial}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{review.user?.name ?? review.user?.username ?? "مستخدم"}</span>
            <span className="b-verified"><i><IconCheck size={10} /></i> موثّق</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}>
            <span style={{ color: "#fbbf24", fontSize: 12 }}>{renderStars(review.rating)}</span>
            <span style={{ fontSize: 11, color: "#475569" }}>منذ {timeAgo(review.createdAt)}</span>
          </div>
        </div>
      </div>
      {review.title && <p style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", marginBottom: 4 }}>{review.title}</p>}
      <p style={{ fontSize: 12, lineHeight: 1.7, color: "#94a3b8" }}>{review.content}</p>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button className="helpful-btn" onClick={() => { if (!voted) { setUpCount((c: number) => c + 1); setVoted("up"); onHelpful?.(review.id, "up") } }}>
          <i><IconThumbUp size={11} /></i> مفيد ({upCount})
        </button>
        <button className="helpful-btn" onClick={() => { if (!voted) { setDnCount((c: number) => c + 1); setVoted("down"); onHelpful?.(review.id, "down") } }}>
          <i><IconThumbDown size={11} /></i> ({dnCount})
        </button>
      </div>
    </div>
  )
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "اليوم"
  if (days === 1) return "أمس"
  if (days < 7) return `${days} أيام`
  if (days < 30) return `${Math.floor(days / 7)} أسابيع`
  return `${Math.floor(days / 30)} شهر`
}

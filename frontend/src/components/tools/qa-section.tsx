import { useState, useCallback } from "react"
import { IconHelpCircle, IconQuestionMark, IconCheck, IconUsers } from "@tabler/icons-react"

interface QaSectionProps {
  faqs: { question: string; answer: string }[]
}

export function QaSection({ faqs }: QaSectionProps) {
  const [showAsk, setShowAsk] = useState(false)

  const handleAsk = useCallback(() => {
    setShowAsk(false)
  }, [])

  if (!faqs.length) return null

  return (
    <>
      <div className="sec-title">
        <i><IconHelpCircle size={16} /></i> الأسئلة الشائعة
        <span style={{ marginInlineStart: "auto", fontSize: 11, color: "hsl(var(--muted-foreground))", fontWeight: 400 }}>{faqs.length} سؤال</span>
      </div>
      {faqs.map((faq, idx) => (
        <div className="qa-card" key={idx}>
          <div style={{ display: "flex", gap: 7, marginBottom: 7, fontSize: 13, fontWeight: 500, color: "hsl(var(--foreground))", alignItems: "flex-start" }}>
            <i style={{ color: "hsl(var(--accent))", fontSize: 15, flexShrink: 0, marginTop: 1, display: "flex" }}>
              <IconQuestionMark size={15} />
            </i>
            <span>{faq.question}</span>
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.7, color: "hsl(var(--muted-foreground))", paddingInlineStart: 22 }}>{faq.answer}</p>
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 5, paddingInlineStart: 22 }}>
            <i style={{ color: "#4ade80", fontSize: 11, display: "inline-flex", verticalAlign: "middle" }}><IconCheck size={11} /></i> أجاب فريق التحرير · 45 شخص وجد هذا مفيداً
          </div>
        </div>
      ))}
        <div className="card" style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 7 }}>لديك سؤال؟ اسأل المجتمع</div>
        <input className="fake-input" style={{ marginBottom: 9 }} placeholder="اكتب سؤالك هنا..." />
        <button className="submit-btn" onClick={handleAsk}>إرسال السؤال</button>
      </div>
    </>
  )
}

import { IconCircleCheck, IconCheck, IconCircleX, IconX, IconScale } from "@tabler/icons-react"

interface ProsConsProps {
  pros: string[]
  cons: string[]
}

export function ProsCons({ pros, cons }: ProsConsProps) {
  if (!pros.length && !cons.length) return null
  return (
    <>
      <div className="sec-title"><i><IconScale size={16} /></i> المميزات والعيوب</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        {pros.length > 0 && (
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 500, color: "hsl(142 71% 40%)", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <i><IconCircleCheck size={13} /></i> المميزات
            </div>
            {pros.map((p, i) => (
              <div className="pro-con" key={i}>
                <i><IconCheck size={13} style={{ color: "hsl(142 71% 40%)" }} /></i>
                <span>{p}</span>
              </div>
            ))}
          </div>
        )}
        {cons.length > 0 && (
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 500, color: "hsl(0 84% 50%)", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <i><IconCircleX size={13} /></i> العيوب
            </div>
            {cons.map((c, i) => (
              <div className="pro-con" key={i}>
                <i><IconX size={13} style={{ color: "hsl(0 84% 50%)" }} /></i>
                <span>{c}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

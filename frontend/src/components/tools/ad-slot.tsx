interface AdSlotProps {
  height?: string
  label?: string
  desc?: string
  note?: string
}

export function AdSlot({ height = "72px", label = "Leaderboard Banner — 728×90", desc, note }: AdSlotProps) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", textAlign: "center", marginBottom: 3 }}>إعلان</div>
      <div className="ad-box" style={{ height }}>
        <span className="ad-tag">AD</span>
        <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{label}</span>
        {note && <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>{note}</span>}
        {desc && <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>{desc}</span>}
      </div>
    </div>
  )
}

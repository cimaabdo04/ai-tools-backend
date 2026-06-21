interface MetricsGridProps {
  entries: [string, string][]
}

export function MetricsGrid({ entries }: MetricsGridProps) {
  if (!entries.length) return null
  const display = entries.slice(0, 4)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-5">
      {display.map(([key, val]) => (
        <div className="metric" key={key}>
          <div className="metric-val">{val}</div>
          <div className="metric-lbl">{key}</div>
        </div>
      ))}
    </div>
  )
}

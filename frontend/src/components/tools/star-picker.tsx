import { useState, useCallback } from "react"

interface StarPickerProps {
  value: number
  onChange: (v: number) => void
}

export function StarPicker({ value, onChange }: StarPickerProps) {
  const [hover, setHover] = useState(0)

  const handleClick = useCallback((v: number) => {
    onChange(v)
  }, [onChange])

  return (
    <div style={{ display: "flex", gap: 5, flexDirection: "row-reverse", justifyContent: "flex-end" }}>
      {[5, 4, 3, 2, 1].map((v) => {
        const active = (hover || value) >= v
        return (
          <span
            key={v}
            className="star-i"
            style={{ color: active ? "#fbbf24" : "#334155" }}
            onMouseEnter={() => setHover(v)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleClick(v)}
          >
            ★
          </span>
        )
      })}
    </div>
  )
}

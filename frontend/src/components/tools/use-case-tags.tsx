import { IconBulb } from "@tabler/icons-react"

interface UseCaseTagsProps {
  tags: string[]
}

export function UseCaseTags({ tags }: UseCaseTagsProps) {
  if (!tags.length) return null
  return (
    <>
      <div className="sec-title"><i><IconBulb size={16} /></i> أفضل الاستخدامات</div>
      <div style={{ marginBottom: 6 }}>
        {tags.map((t, i) => (
          <span className="tag" key={i}>{t}</span>
        ))}
      </div>
    </>
  )
}

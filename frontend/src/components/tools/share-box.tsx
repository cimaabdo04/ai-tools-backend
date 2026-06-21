"use client"

import { useState, useCallback } from "react"
import {
  IconBrandWhatsapp, IconBrandX, IconBrandFacebook, IconBrandLinkedin,
  IconBrandTelegram, IconBrandReddit, IconMail, IconLink, IconCheck,
} from "@tabler/icons-react"
import { absoluteUrl } from "@lib/utils"
import { ROUTES } from "@lib/constants"

interface CompactShareBoxProps {
  toolName: string
  slug: string
}

export function CompactShareBox({ toolName, slug }: CompactShareBoxProps) {
  const pageUrl = absoluteUrl(ROUTES.TOOL_DETAIL(slug))
  const encodedUrl = encodeURIComponent(pageUrl)
  const encodedText = encodeURIComponent(`🔥 ${toolName} — أداة AI مذهلة تستحق التجربة!`)

  const [copied, setCopied] = useState(false)

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }, [pageUrl])

  const socials = [
    { icon: IconBrandWhatsapp, href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`, label: "واتساب" },
    { icon: IconBrandX, href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, label: "X" },
    { icon: IconBrandFacebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, label: "Facebook" },
    { icon: IconBrandLinkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, label: "LinkedIn" },
    { icon: IconBrandTelegram, href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, label: "Telegram" },
    { icon: IconBrandReddit, href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`, label: "Reddit" },
    { icon: IconMail, href: `mailto:?subject=${encodedText}&body=${encodedUrl}`, label: "إيميل" },
  ]

  return (
    <div className="sidebar-share">
      <div className="sidebar-share-title">شارك {toolName}</div>
      <div className="sidebar-share-grid">
        {socials.map((s, i) => (
          <a
            key={i}
            className="sidebar-share-icon"
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
          >
            <s.icon size={20} />
          </a>
        ))}
        <button
          className="sidebar-share-icon"
          onClick={handleCopyLink}
          title={copied ? "تم النسخ" : "نسخ الرابط"}
        >
          {copied ? <IconCheck size={20} /> : <IconLink size={20} />}
        </button>
      </div>
    </div>
  )
}

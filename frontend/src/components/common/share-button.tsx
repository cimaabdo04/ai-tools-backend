"use client";

import { useState } from "react";
import { cn, absoluteUrl } from "@lib/utils";
import { Button } from "@components/ui/button";
import { Tooltip } from "@components/ui/tooltip";
import { Share2, Check, Twitter, Facebook, Link, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";

interface ShareButtonProps {
  title: string;
  path?: string;
  className?: string;
}

export function ShareButton({ title, path = "", className }: ShareButtonProps) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(path);

  const shareLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn("Failed to copy URL");
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label={`Share on ${link.name}`}
        >
          <link.icon className="h-4 w-4" />
        </a>
      ))}
      <Tooltip content={copied ? t("share.copied") : t("share.copyLink")}>
        <button
          onClick={copyToClipboard}
          className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label={t("share.copyLink")}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Link className="h-4 w-4" />
          )}
        </button>
      </Tooltip>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@lib/api";
import { trackAdClick } from "@lib/tracking";
import DOMPurify from "dompurify";

interface Banner {
  id: string;
  name: string;
  type: string;
  imageUrl?: string;
  htmlContent?: string;
  linkUrl?: string;
  placement: string;
}

interface AdSlotProps {
  placement: string;
  className?: string;
}

export function AdSlot({ placement, className = "" }: AdSlotProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["banners", placement],
    queryFn: () => api.get<Banner[]>("/banners", { params: { placement } }),
    staleTime: 2 * 60 * 1000,
  });

  const banners = Array.isArray(data) ? data : [];

  if (isLoading || banners.length === 0) {
    return <div className={`min-h-[90px] bg-muted/30 rounded-lg flex items-center justify-center text-xs text-muted-foreground ${className}`}>Advertisement</div>;
  }

  const banner = banners[0];

  const handleClick = () => {
    trackAdClick(placement, banner.id);
    api.post(`/banners/${banner.id}/click`).catch(() => {});
  };

  if (banner.type === "html" && banner.htmlContent) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(banner.htmlContent) }}
        onClick={handleClick}
      />
    );
  }

  return (
    <a
      href={banner.linkUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`block ${className}`}
    >
      {banner.imageUrl && (
        <img
          src={banner.imageUrl}
          alt={banner.name}
          className="w-full h-auto rounded-lg"
          loading="lazy"
        />
      )}
    </a>
  );
}

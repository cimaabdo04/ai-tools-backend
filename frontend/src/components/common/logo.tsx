import Link from "next/link";
import { cn } from "@lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-base" },
    md: { icon: 36, text: "text-lg" },
    lg: { icon: 48, text: "text-2xl" },
  };
  const { icon, text } = sizes[size];
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="white" strokeWidth="1.5" opacity="0.9" />
        <circle cx="20" cy="12" r="2" fill="white" />
        <circle cx="20" cy="28" r="2" fill="white" />
        <circle cx="12" cy="20" r="2" fill="white" />
        <circle cx="28" cy="20" r="2" fill="white" />
        <circle cx="14.3" cy="14.3" r="1.5" fill="white" opacity="0.7" />
        <circle cx="25.7" cy="25.7" r="1.5" fill="white" opacity="0.7" />
        <circle cx="25.7" cy="14.3" r="1.5" fill="white" opacity="0.7" />
        <circle cx="14.3" cy="25.7" r="1.5" fill="white" opacity="0.7" />
        <line x1="20" y1="12" x2="20" y2="28" stroke="white" strokeWidth="0.75" opacity="0.4" />
        <line x1="12" y1="20" x2="28" y2="20" stroke="white" strokeWidth="0.75" opacity="0.4" />
        <line x1="14.3" y1="14.3" x2="25.7" y2="25.7" stroke="white" strokeWidth="0.75" opacity="0.4" />
        <line x1="25.7" y1="14.3" x2="14.3" y2="25.7" stroke="white" strokeWidth="0.75" opacity="0.4" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-bold text-foreground tracking-tight", text)}>
            <span className="text-primary">AI</span>atlas
          </span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
            دليل أدوات الذكاء الاصطناعي
          </span>
        </div>
      )}
    </Link>
  );
}

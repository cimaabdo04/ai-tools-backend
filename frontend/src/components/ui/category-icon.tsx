import { Bot, Code, Image, Music, Pen, Video, Brain, Cloud, Shield, Search, MessageCircle, Palette, Zap, Megaphone, Box, BookOpen, ShoppingCart, Gamepad2, type LucideIcon } from "lucide-react";
import { cn } from "@lib/utils";

const iconComponents: Record<string, LucideIcon> = {
  bot: Bot, code: Code, image: Image, music: Music,
  pen: Pen, video: Video, brain: Brain, cloud: Cloud,
  shield: Shield, search: Search, message: MessageCircle,
  palette: Palette, zap: Zap, megaphone: Megaphone,
  cube: Box, "book-open": BookOpen,
  "shopping-cart": ShoppingCart, "gamepad-2": Gamepad2,
};

interface CategoryIconProps {
  icon?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "h-8 w-8", icon: "h-4 w-4", rounded: "rounded-lg" },
  md: { container: "h-10 w-10", icon: "h-5 w-5", rounded: "rounded-xl" },
  lg: { container: "h-12 w-12", icon: "h-6 w-6", rounded: "rounded-xl" },
};

export function CategoryIcon({ icon, color, size = "md", className }: CategoryIconProps) {
  const Icon = icon ? iconComponents[icon] : undefined;
  const bgColor = color || "var(--primary)";
  const textColor = color || "var(--primary)";
  const s = sizeMap[size];

  return (
    <div
      className={cn(s.container, s.rounded, "flex items-center justify-center shrink-0 transition-colors", className)}
      style={{ backgroundColor: `${bgColor}1A`, color: textColor }}
    >
      {Icon ? (
        <Icon className={s.icon} style={{ color: textColor }} />
      ) : (
        <Bot className={s.icon} style={{ color: textColor }} />
      )}
    </div>
  );
}

export function getCategoryColor(color?: string): string {
  return color || "#6366f1";
}

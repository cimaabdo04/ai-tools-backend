"use client";

import { cn } from "@lib/utils";
import { Tooltip } from "@components/ui/tooltip";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useCheckBookmark, useAddBookmark, useRemoveBookmark } from "@hooks/use-bookmarks";
import { useAuthStore } from "@stores/auth-store";
import { ROUTES } from "@lib/constants";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface BookmarkButtonProps {
  toolId: string;
  className?: string;
}

export function BookmarkButton({ toolId, className }: BookmarkButtonProps) {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: checkData } = useCheckBookmark(toolId);
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const isBookmarked = checkData?.bookmarked ?? false;
  const bookmarkId = checkData?.bookmarkId;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    if (isBookmarked && bookmarkId) {
      removeBookmark.mutate(bookmarkId);
    } else {
      addBookmark.mutate(toolId);
    }
  };

  const isLoading = addBookmark.isPending || removeBookmark.isPending;

  return (
    <Tooltip
      content={
        !isAuthenticated
          ? t("bookmarks.loginRequired")
          : isBookmarked
          ? t("bookmarks.remove")
          : t("bookmarks.add")
      }
    >
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          "rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50",
          isBookmarked && "text-primary",
          className
        )}
        aria-label={
          isBookmarked ? t("bookmarks.remove") : t("bookmarks.add")
        }
      >
        {isBookmarked ? (
          <BookmarkCheck className="h-4 w-4 fill-primary" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </button>
    </Tooltip>
  );
}

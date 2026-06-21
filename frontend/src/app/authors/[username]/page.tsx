"use client";

import { use } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { MapPin, Link as LinkIcon, Calendar, Twitter, Github } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { ToolGrid } from "@components/common/tool-grid";
import { useTools } from "@hooks/use-tools";
import { getInitials, formatDate } from "@lib/utils";
import { ROUTES } from "@lib/constants";

interface AuthorProfile {
  username: string;
  name: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  twitterUrl?: string;
  githubUrl?: string;
  createdAt: string;
  toolCount: number;
}

const MOCK_AUTHOR: AuthorProfile = {
  username: "johndoe",
  name: "John Doe",
  bio: "AI enthusiast and full-stack developer. I love discovering and reviewing new AI tools.",
  avatar: "",
  location: "San Francisco, CA",
  website: "https://johndoe.com",
  twitterUrl: "https://twitter.com/johndoe",
  githubUrl: "https://github.com/johndoe",
  createdAt: "2024-01-15",
  toolCount: 5,
};

export default function AuthorProfilePage({
  params,
}: {
  params: Promise<{ username: string; locale: string }>;
}) {
  const { username, locale } = use(params);
  const t = useTranslations();
  const isRtl = locale === "ar";

  const { data, isLoading, isError, refetch } = useTools({ perPage: 50 });
  const tools = data?.data ?? [];

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card p-8 mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={MOCK_AUTHOR.avatar} alt={MOCK_AUTHOR.name} />
            <AvatarFallback className="text-xl">
              {getInitials(MOCK_AUTHOR.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{MOCK_AUTHOR.name}</h1>
            <p className="text-muted-foreground mt-1">
              @{MOCK_AUTHOR.username}
            </p>
            {MOCK_AUTHOR.bio && (
              <p className="text-sm text-muted-foreground mt-3 max-w-lg">
                {MOCK_AUTHOR.bio}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              {MOCK_AUTHOR.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {MOCK_AUTHOR.location}
                </span>
              )}
              {MOCK_AUTHOR.website && (
                <a
                  href={MOCK_AUTHOR.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {formatDate(MOCK_AUTHOR.createdAt)}
              </span>
              <Badge variant="secondary">{MOCK_AUTHOR.toolCount} tools</Badge>
            </div>
            <div className="flex items-center gap-2 mt-4">
              {MOCK_AUTHOR.twitterUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={MOCK_AUTHOR.twitterUrl} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4 mr-1" />
                    Twitter
                  </a>
                </Button>
              )}
              {MOCK_AUTHOR.githubUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={MOCK_AUTHOR.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-1" />
                    GitHub
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <section>
        <h2 className="text-2xl font-bold mb-6">
          Tools by {MOCK_AUTHOR.name}
        </h2>
        <ToolGrid
          tools={tools}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
        />
      </section>
    </div>
  );
}

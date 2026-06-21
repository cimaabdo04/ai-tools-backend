"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Heart, Target, Eye, Zap } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To make AI tools accessible and discoverable for everyone, helping individuals and businesses find the perfect solutions for their needs.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description: "A world where finding the right AI tool is as easy as searching for any other product, with transparent comparisons and trusted reviews.",
  },
  {
    icon: Heart,
    title: "Community First",
    description: "We believe in the power of community. Every review, bookmark, and share helps others make informed decisions about AI tools.",
  },
  {
    icon: Zap,
    title: "Curated Quality",
    description: "Every tool in our directory is reviewed and categorized to ensure you find only the best, most relevant AI solutions.",
  },
];

export default function AboutPage() {
  const t = useTranslations();

  return (
    <div className="container py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight mb-4">About Us</h1>
        <p className="text-lg text-muted-foreground">
          We are on a mission to organize the world&apos;s AI tools and make them easily discoverable.
        </p>
      </motion.div>

      <section className="prose prose-neutral dark:prose-invert max-w-none mb-16">
        <p>
          AI Tools Directory was founded in 2024 with a simple goal: to help people find the best AI tools
          for their specific needs. As the AI landscape exploded with thousands of new tools and services,
          we realized there was no central place to discover, compare, and review them all.
        </p>
        <p>
          Today, AI Tools Directory is the largest curated directory of AI tools on the web. We list hundreds
          of tools across dozens of categories, from content creation and image generation to code assistants
          and data analytics.
        </p>
        <p>
          Our team of AI enthusiasts and tech reviewers carefully evaluates each submission to ensure quality
          and accuracy. We provide detailed information, user reviews, and side-by-side comparisons so you
          can make informed decisions.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {values.map((value, i) => (
          <motion.div
            key={value.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <value.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
            <p className="text-sm text-muted-foreground">{value.description}</p>
          </motion.div>
        ))}
      </div>

      <section className="rounded-xl border bg-muted/30 p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-6">
          Whether you&apos;re an AI enthusiast, a developer, or a business owner, we invite you to
          contribute to our growing community.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Submit a Tool
          </span>
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Write Reviews
          </span>
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Share with Friends
          </span>
        </div>
      </section>
    </div>
  );
}

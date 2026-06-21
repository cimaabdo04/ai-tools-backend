"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "@components/ui/input";
import { useState } from "react";

const faqs = [
  {
    category: "General",
    questions: [
      { q: "What is AI Tools Directory?", a: "AI Tools Directory is a curated platform that helps you discover, compare, and review AI tools. We list hundreds of AI tools across multiple categories." },
      { q: "Is AI Tools Directory free to use?", a: "Yes, browsing and searching for AI tools is completely free. Some advanced features like submitting tools and writing reviews require a free account." },
      { q: "How are tools added to the directory?", a: "Tools can be submitted by anyone through our submission form. Each submission is reviewed by our team for quality and accuracy before being published." },
    ],
  },
  {
    category: "Account",
    questions: [
      { q: "How do I create an account?", a: "Click the 'Sign Up' button in the top navigation bar. You can register with your email and password, or use Google/GitHub OAuth." },
      { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login page and enter your email. We'll send you a reset link." },
      { q: "Can I delete my account?", a: "Yes, you can delete your account from the Settings page. This action is permanent and cannot be undone." },
    ],
  },
  {
    category: "Tools",
    questions: [
      { q: "How do I submit a tool?", a: "Click 'Submit Tool' in the navigation bar. Fill in the required information including name, description, website URL, and category." },
      { q: "How long does review take?", a: "Our team typically reviews submissions within 24-48 hours. You'll be notified once your tool is approved." },
      { q: "Can I edit or remove my tool listing?", a: "Yes, you can manage your submitted tools from your Dashboard. You can edit details or remove listings at any time." },
    ],
  },
  {
    category: "Reviews & Ratings",
    questions: [
      { q: "How do I leave a review?", a: "Navigate to any tool's detail page and scroll to the reviews section. Click 'Write a Review' to share your experience." },
      { q: "Can I edit my review?", a: "Yes, you can edit or delete your reviews from your Dashboard or the tool's review section." },
      { q: "How is the overall rating calculated?", a: "The overall rating is an average of all user reviews for that tool, displayed on a 1-5 star scale." },
    ],
  },
];

export default function FaqPage() {
  const t = useTranslations();
  const [search, setSearch] = useState("");

  const filteredFaqs = faqs.map((group) => ({
    ...group,
    questions: group.questions.filter(
      (faq) =>
        faq.q.toLowerCase().includes(search.toLowerCase()) ||
        faq.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((group) => group.questions.length > 0);

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-6">
          Find answers to commonly asked questions about AI Tools Directory.
        </p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="pl-10"
          />
        </div>
      </motion.div>

      <div className="space-y-8">
        {filteredFaqs.map((group) => (
          <section key={group.category}>
            <h2 className="text-xl font-bold mb-4">{group.category}</h2>
            <div className="space-y-3">
              {group.questions.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-lg border bg-card"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium hover:text-primary transition-colors">
                    {faq.q}
                    <HelpCircle className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform shrink-0 ml-2" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

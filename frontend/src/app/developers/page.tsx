"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code, Key, BookOpen, Terminal, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";

const sections = [
  {
    id: "overview",
    title: "Overview",
    content: `
      The AI Tools Directory API allows developers to programmatically access our database of AI tools,
      categories, reviews, and more. Use our API to build integrations, power your own directories,
      or enrich your applications with AI tool data.
    `,
  },
  {
    id: "authentication",
    title: "Authentication",
    content: `
      All API requests require authentication via an API key. Include your API key in the
      Authorization header of each request.
    `,
    code: `fetch('https://api.aitoolsdirectory.com/v1/tools', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})`,
  },
  {
    id: "endpoints",
    title: "Endpoints",
    content: "The API provides the following main endpoints:",
    endpoints: [
      { method: "GET", path: "/v1/tools", description: "List all tools" },
      { method: "GET", path: "/v1/tools/:slug", description: "Get tool details" },
      { method: "GET", path: "/v1/categories", description: "List categories" },
      { method: "GET", path: "/v1/categories/:slug", description: "Get category details" },
      { method: "GET", path: "/v1/search?q=query", description: "Search tools" },
    ],
  },
  {
    id: "pagination",
    title: "Pagination",
    content: "API responses are paginated. Use the following query parameters:",
    code: `// Response format
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 12,
    "totalPages": 9
  }
}

// Query parameters
?page=1&perPage=12`,
  },
  {
    id: "rate-limiting",
    title: "Rate Limiting",
    content: `
      API requests are rate-limited to 100 requests per minute for free tier and 1000 requests
      per minute for professional tier. Rate limit headers are included in all responses.
    `,
  },
];

export default function DevelopersPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [copiedCode, setCopiedCode] = useState("");

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Code className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">API Documentation</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Integrate AI Tools Directory data into your applications.
        </p>
      </motion.div>

      <div className="flex gap-8">
        <nav className="hidden lg:block w-56 shrink-0 space-y-1 sticky top-20 self-start">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                activeSection === section.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {section.title}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0 max-w-3xl">
          {sections.map((section) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
              <p className="text-muted-foreground mb-4 whitespace-pre-line">{section.content}</p>

              {section.code && (
                <div className="relative rounded-lg bg-muted p-4 mb-4">
                  <button
                    onClick={() => copyCode(section.code!)}
                    className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    {copiedCode === section.code ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <pre className="text-sm overflow-x-auto">{section.code}</pre>
                </div>
              )}

              {section.endpoints && (
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Method</th>
                        <th className="p-3 text-left font-medium">Path</th>
                        <th className="p-3 text-left font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.endpoints.map((ep) => (
                        <tr key={ep.path} className="border-b last:border-0">
                          <td className="p-3">
                            <span className={cn(
                              "inline-flex rounded px-2 py-0.5 text-xs font-medium",
                              ep.method === "GET" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-blue-100 text-blue-700"
                            )}>
                              {ep.method}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-xs">{ep.path}</td>
                          <td className="p-3 text-muted-foreground">{ep.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.section>
          ))}

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Get Your API Key</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up for a Professional plan to get access to the API.
                </p>
              </div>
            </div>
            <Button asChild>
              <a href="/pricing">View Pricing Plans</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

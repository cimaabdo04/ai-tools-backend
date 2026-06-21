type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFunction;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

function gtag(...args: unknown[]) {
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

export function trackEvent(action: string, params?: Record<string, unknown>) {
  gtag("event", action, params);
  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", action, params);
  }
}

export function trackPageView(path: string, title?: string) {
  gtag("event", "page_view", { page_path: path, page_title: title });
}

export function trackToolView(slug: string, name: string, category?: string) {
  trackEvent("view_tool", { tool_slug: slug, tool_name: name, tool_category: category });
}

export function trackToolClick(slug: string, name: string) {
  trackEvent("click_tool", { tool_slug: slug, tool_name: name });
}

export function trackSearch(query: string, resultsCount?: number) {
  trackEvent("search", { search_query: query, results_count: resultsCount });
}

export function trackCompare(toolIds: string[], action: "add" | "remove" | "compare") {
  trackEvent("compare_" + action, { tool_ids: toolIds });
}

export function trackAdClick(placement: string, bannerId: string) {
  trackEvent("ad_click", { placement, banner_id: bannerId });
}

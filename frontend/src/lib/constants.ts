export const APP_NAME = "Aiatlas";
export const APP_DESCRIPTION = "Discover, compare, and find the perfect AI tools for your needs.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  TOOLS: "/tools",
  TOOL_DETAIL: (slug: string) => `/tools/${slug}`,
  CATEGORIES: "/categories",
  CATEGORY_DETAIL: (slug: string) => `/categories/${slug}`,
  SUBMIT_TOOL: "/submit-tool",
  PRICING: "/pricing",
  ABOUT: "/about",
  CONTACT: "/contact",
  BLOG: "/blog",
  FAQ: "/faq",
  DASHBOARD: "/dashboard",
  DASHBOARD_TOOLS: "/dashboard/tools",
  DASHBOARD_BOOKMARKS: "/dashboard/bookmarks",
  DASHBOARD_REVIEWS: "/dashboard/reviews",
  DASHBOARD_PROFILE: "/dashboard/profile",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  DASHBOARD_SUBMISSIONS: "/dashboard/submissions",
  DASHBOARD_SUBMIT: "/dashboard/submit",
  DASHBOARD_COLLECTIONS: "/dashboard/collections",
  DASHBOARD_COLLECTION_DETAIL: (id: string) => `/dashboard/collections/${id}`,
  DASHBOARD_CLAIMS: "/dashboard/claims",
  DASHBOARD_EDITS: "/dashboard/edits",
  DASHBOARD_SUBSCRIPTION: "/dashboard/subscription",
  DASHBOARD_BILLING: "/dashboard/billing",
  DASHBOARD_API_KEYS: "/dashboard/api-keys",
  DASHBOARD_NOTIFICATIONS: "/dashboard/notifications",
  DASHBOARD_MESSAGES: "/dashboard/messages",
  DASHBOARD_AFFILIATES: "/dashboard/affiliates",
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_TOOLS: "/admin/tools",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_REVIEWS: "/admin/reviews",
  ADMIN_SETTINGS: "/admin/settings",
  COMPARE: "/compare",
  BEST: {
    AI_TOOLS: "/best-ai-tools",
    IMAGE_GENERATORS: "/best-ai-image-generators",
    WRITING_TOOLS: "/best-ai-writing-tools",
  },
  USE_CASES: {
    CONTENT_CREATION: "/tools-for-content-creation",
    MARKETING: "/tools-for-marketing",
    DESIGNERS: "/tools-for-designers",
    DEVELOPERS: "/tools-for-developers",
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  TOOLS: {
    LIST: "/tools",
    DETAIL: (slug: string) => `/tools/${slug}`,
    FEATURED: "/tools/featured",
    SEARCH: "/search",
    SUBMIT: "/tools",
    UPDATE: (id: string) => `/tools/${id}`,
    DELETE: (id: string) => `/tools/${id}`,
    MY_TOOLS: "/tools/mine",
  },
  CATEGORIES: {
    LIST: "/categories",
    DETAIL: (slug: string) => `/categories/${slug}`,
    CREATE: "/categories",
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },
  TAGS: {
    DETAIL: (slug: string) => `/tags/${slug}`,
  },
  REVIEWS: {
    LIST: (toolId: string) => `/reviews/tool/${toolId}`,
    CREATE: "/reviews",
    UPDATE: (reviewId: string) => `/reviews/${reviewId}`,
    DELETE: (reviewId: string) => `/reviews/${reviewId}`,
  },
  BOOKMARKS: {
    LIST: "/bookmarks",
    ADD: "/bookmarks",
    REMOVE: (id: string) => `/bookmarks/${id}`,
    CHECK: (toolId: string) => `/bookmarks/check/${toolId}`,
  },
  COMPARE: {
    ADD: "/compare",
    REMOVE: (id: string) => `/compare/${id}`,
    LIST: "/compare",
    CLEAR: "/compare",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    TOOLS: "/admin/tools",
    CATEGORIES: "/admin/categories",
    REVIEWS: "/admin/reviews",
    SETTINGS: "/admin/settings",
  },
  BLOG: {
    LIST: "/cms/blog",
    DETAIL: (slug: string) => `/cms/blog/${slug}`,
  },
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
  },
} as const;

export const LOCALES = [
  { code: "ar", label: "العربية", dir: "rtl" },
] as const;

export const DEFAULT_LOCALE = "ar";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

export const PRICING_MODELS = ["free", "freemium", "paid", "contact"] as const;

export const PLATFORMS = [
  "web",
  "ios",
  "android",
  "mac",
  "windows",
  "linux",
  "api",
  "chrome",
] as const;

export const ITEMS_PER_PAGE = 12;
export const MAX_COMPARE_ITEMS = 5;
export const DEBOUNCE_DELAY = 300;

import { create } from "zustand";

type PricingModel = "free" | "freemium" | "paid" | "contact";
type SortOption =
  | "newest"
  | "oldest"
  | "popular"
  | "rating"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc";

interface FilterState {
  search: string;
  categoryId: string | null;
  tags: string[];
  pricing: PricingModel[];
  sort: SortOption;
  minRating: number;
  page: number;
  setSearch: (search: string) => void;
  setCategoryId: (id: string | null) => void;
  toggleTag: (tag: string) => void;
  setTags: (tags: string[]) => void;
  togglePricing: (model: PricingModel) => void;
  setPricing: (pricing: PricingModel[]) => void;
  setSort: (sort: SortOption) => void;
  setMinRating: (rating: number) => void;
  setPage: (page: number) => void;
  reset: () => void;
  getParams: () => Record<string, string>;
}

const initialState = {
  search: "",
  categoryId: null as string | null,
  tags: [] as string[],
  pricing: [] as PricingModel[],
  sort: "newest" as SortOption,
  minRating: 0,
  page: 1,
};

export const useFilterStore = create<FilterState>()((set, get) => ({
  ...initialState,

  setSearch: (search) => set({ search, page: 1 }),
  setCategoryId: (id) => set({ categoryId: id, page: 1 }),

  toggleTag: (tag) =>
    set((state) => {
      const tags = state.tags.includes(tag)
        ? state.tags.filter((t) => t !== tag)
        : [...state.tags, tag];
      return { tags, page: 1 };
    }),

  setTags: (tags) => set({ tags, page: 1 }),

  togglePricing: (model) =>
    set((state) => {
      const pricing = state.pricing.includes(model)
        ? state.pricing.filter((p) => p !== model)
        : [...state.pricing, model];
      return { pricing, page: 1 };
    }),

  setPricing: (pricing) => set({ pricing, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setMinRating: (rating) => set({ minRating: rating, page: 1 }),
  setPage: (page) => set({ page }),

  reset: () => set(initialState),

  getParams: () => {
    const state = get();
    const params: Record<string, string> = {};
    if (state.search) params.search = state.search;
    if (state.categoryId) params.categoryId = state.categoryId;
    if (state.tags.length) params.tags = state.tags.join(",");
    if (state.pricing.length) params.pricing = state.pricing.join(",");
    if (state.sort !== "newest") params.sort = state.sort;
    if (state.minRating) params.minRating = String(state.minRating);
    if (state.page > 1) params.page = String(state.page);
    return params;
  },
}));

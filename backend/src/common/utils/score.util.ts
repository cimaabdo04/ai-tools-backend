interface ScoreInput {
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  clickCount: number;
  bookmarkCount: number;
  daysSincePublished: number;
  isFeatured: boolean;
  isVerified: boolean;
}

const WEIGHTS = {
  rating: 3.0,
  reviews: 2.0,
  views: 0.1,
  clicks: 0.5,
  bookmarks: 1.5,
  recency: 0.5,
  featured: 5.0,
  verified: 3.0,
};

export function calculateRankScore(input: ScoreInput): number {
  const {
    averageRating,
    reviewCount,
    viewCount,
    clickCount,
    bookmarkCount,
    daysSincePublished,
    isFeatured,
    isVerified,
  } = input;

  const ratingScore = averageRating * WEIGHTS.rating;
  const reviewScore = Math.log10(reviewCount + 1) * WEIGHTS.reviews;
  const viewScore = Math.log10(viewCount + 1) * WEIGHTS.views;
  const clickScore = Math.log10(clickCount + 1) * WEIGHTS.clicks;
  const bookmarkScore = Math.log10(bookmarkCount + 1) * WEIGHTS.bookmarks;
  const recencyScore = Math.max(0, 1 - daysSincePublished / 365) * WEIGHTS.recency * 10;
  const featuredScore = isFeatured ? WEIGHTS.featured : 0;
  const verifiedScore = isVerified ? WEIGHTS.verified : 0;

  const total = ratingScore + reviewScore + viewScore + clickScore + bookmarkScore + recencyScore + featuredScore + verifiedScore;

  return Math.round(total * 10000) / 10000;
}

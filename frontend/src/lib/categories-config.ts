export interface CategorySub {
  name: string;
  tagSlug?: string;
}

export interface CategoryDisplay {
  emoji: string;
  gradientClass: string;
  dotClass: string;
  subcategories: CategorySub[];
  subCount: number;
}

export const categoryConfig: Record<string, CategoryDisplay> = {
  "design-art": {
    emoji: "🎨", gradientClass: "icon-design", dotClass: "dot-pink",
    subCount: 12,
    subcategories: [
      { name: "تصميم الشعار", tagSlug: "logo-design" },
      { name: "تصميم UI/UX", tagSlug: "ui-ux-design" },
      { name: "تصميم الجرافيك" },
      { name: "تحرير الصور", tagSlug: "image-editing" },
      { name: "خلفيات" }, { name: "أيقونات" },
      { name: "شعارات" }, { name: "فن رقمي" }, { name: "تصميم ملصقات" },
      { name: "تغليف منتجات" }, { name: "كتب ومصمم" }, { name: "تصميم ملابس" },
    ],
  },
  video: {
    emoji: "🎬", gradientClass: "icon-video", dotClass: "dot-red",
    subCount: 10,
    subcategories: [
      { name: "مونتاج فيديو", tagSlug: "video-editing" },
      { name: "إنشاء فيديو", tagSlug: "video-generation" },
      { name: "أنيميشن 2D" },
      { name: "أنيميشن 3D" },
      { name: "موشن جرافيك", tagSlug: "motion-graphics" },
      { name: "تحويل نص لفيديو" },
      { name: "فيديو القصص" }, { name: "عناوين وداخليات" }, { name: "قص وتعديل" },
      { name: "مؤثرات خاصة" },
    ],
  },
  "text-writing": {
    emoji: "✍️", gradientClass: "icon-writing", dotClass: "dot-blue",
    subCount: 10,
    subcategories: [
      { name: "كاتب محتوى", tagSlug: "copywriting" },
      { name: "كاتب SEO" }, { name: "كاتب إعلانات" },
      { name: "كاتب رحلات" }, { name: "كاتب أكواد" }, { name: "إعادة كتابة" },
      { name: "تلخيص" }, { name: "تدقيق لغوي" }, { name: "أفكار محتوى" },
      { name: "ناسخ بريد" },
    ],
  },
  "audio-music": {
    emoji: "🎵", gradientClass: "icon-audio", dotClass: "dot-purple",
    subCount: 8,
    subcategories: [
      { name: "تحويل نص لصوت", tagSlug: "text-to-speech" },
      { name: "إنشاء موسيقى", tagSlug: "music-generation" },
      { name: "إزالة ضوضاء" },
      { name: "فصل الأصوات" }, { name: "مؤثرات صوتية" }, { name: "بودكاست" },
      { name: "ترجمة صوت" }, { name: "معزز صوت" },
    ],
  },
  "code-development": {
    emoji: "💻", gradientClass: "icon-code", dotClass: "dot-green",
    subCount: 10,
    subcategories: [
      { name: "مساعد كود" }, { name: "مراجعة كود", tagSlug: "code-review" },
      { name: "إكمال كود" },
      { name: "تحويل كود" }, { name: "شرح كود" }, { name: "تصحيح أخطاء" },
      { name: "بناء تطبيقات" }, { name: "API", tagSlug: "api" },
      { name: "قواعد بيانات" }, { name: "DevOps" },
    ],
  },
  "research-analysis": {
    emoji: "🔍", gradientClass: "icon-research", dotClass: "dot-amber",
    subCount: 8,
    subcategories: [
      { name: "بحث ويب", tagSlug: "web-search" },
      { name: "تحليل بيانات", tagSlug: "data-analysis" },
      { name: "ملخصات" },
      { name: "أسئلة وأجوبة" }, { name: "بحث أكاديمي" }, { name: "مقارنة" },
      { name: "تقارير" }, { name: "ذكاء تنافسي" },
    ],
  },
  productivity: {
    emoji: "⚡", gradientClass: "icon-productivity", dotClass: "dot-cyan",
    subCount: 8,
    subcategories: [
      { name: "مساعد ذكي", tagSlug: "smart-assistant" },
      { name: "جدولة" },
      { name: "تنظيم مهام", tagSlug: "task-management" },
      { name: "ملاحظات" }, { name: "ذاكرة" }, { name: "ترجمة" },
      { name: "تحويل ملفات" }, { name: "OCR" },
    ],
  },
  "marketing-sales": {
    emoji: "📈", gradientClass: "icon-marketing", dotClass: "dot-rose",
    subCount: 10,
    subcategories: [
      { name: "سوشيال ميديا", tagSlug: "social-media" },
      { name: "إعلانات", tagSlug: "ad-copy" },
      { name: "email marketing" },
      { name: "SEO" }, { name: "تحليل أداء" }, { name: "جمهور مستهدف" },
      { name: "محتوى تسويقي" }, { name: "قوالب" }, { name: "CRM" },
      { name: "روبوتات دردشة", tagSlug: "chatbot" },
    ],
  },
  "3d-modeling": {
    emoji: "🎮", gradientClass: "icon-3d", dotClass: "dot-purple",
    subCount: 6,
    subcategories: [
      { name: "إنشاء 3D", tagSlug: "3d-creation" },
      { name: "نص لـ 3D", tagSlug: "text-to-3d" },
      { name: "تعديل نماذج" },
      { name: "واقع افتراضي" }, { name: "ألعاب" }, { name: "هندسة معمارية" },
    ],
  },
  education: {
    emoji: "📚", gradientClass: "icon-education", dotClass: "dot-green",
    subCount: 8,
    subcategories: [
      { name: "تعلم لغات", tagSlug: "language-learning" },
      { name: "دورات", tagSlug: "course-creation" },
      { name: "مدرسين" },
      { name: "اختبارات" }, { name: "بحث أكاديمي" }, { name: "تلخيص دروس" },
      { name: "واجبات" }, { name: "كتب إلكترونية" },
    ],
  },
  ecommerce: {
    emoji: "🛒", gradientClass: "icon-commerce", dotClass: "dot-amber",
    subCount: 6,
    subcategories: [
      { name: "وصف منتجات", tagSlug: "product-description" },
      { name: "صور منتجات" },
      { name: "تحليل سوق", tagSlug: "market-analysis" },
      { name: "أسعار" }, { name: "متاجر" }, { name: "إدارة مخزون" },
    ],
  },
  gaming: {
    emoji: "🎯", gradientClass: "icon-gaming", dotClass: "dot-blue",
    subCount: 6,
    subcategories: [
      { name: "ألعاب نصية" },
      { name: "دردشة AI", tagSlug: "ai-chat" },
      { name: "شخصيات" },
      { name: "قصص تفاعلية", tagSlug: "story-games" },
      { name: "فن توليدي" }, { name: "موسيقى توليدية" },
    ],
  },
  "image-generation": {
    emoji: "🎨", gradientClass: "icon-design", dotClass: "dot-pink",
    subCount: 6,
    subcategories: [
      { name: "توليد صور", tagSlug: "photo-generation" },
      { name: "تحرير صور", tagSlug: "image-editing" },
      { name: "فن رقمي" },
      { name: "تصميم جرافيك" }, { name: "خلفيات" }, { name: "أيقونات" },
    ],
  },
};

export function getCategoryConfig(slug: string): CategoryDisplay {
  return categoryConfig[slug] || {
    emoji: "🤖",
    gradientClass: "icon-code",
    dotClass: "dot-green",
    subCount: 0,
    subcategories: [],
  };
}

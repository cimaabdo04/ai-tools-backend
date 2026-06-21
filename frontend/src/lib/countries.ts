const countryNames: Record<string, string> = {
  US: "الولايات المتحدة",
  GB: "المملكة المتحدة",
  CA: "كندا",
  AU: "أستراليا",
  DE: "ألمانيا",
  FR: "فرنسا",
  CN: "الصين",
  JP: "اليابان",
  KR: "كوريا الجنوبية",
  SG: "سنغافورة",
  IN: "الهند",
  IL: "إسرائيل",
  AE: "الإمارات",
  SA: "السعودية",
  QA: "قطر",
  EG: "مصر",
  TR: "تركيا",
  RU: "روسيا",
  BR: "البرازيل",
  CH: "سويسرا",
  NL: "هولندا",
  SE: "السويد",
  NO: "النرويج",
  DK: "الدنمارك",
  FI: "فنلندا",
  IE: "أيرلندا",
  ES: "إسبانيا",
  IT: "إيطاليا",
  PT: "البرتغال",
  BE: "بلجيكا",
  AT: "النمسا",
  PL: "بولندا",
  UA: "أوكرانيا",
  TW: "تايوان",
  HK: "هونغ كونغ",
  NZ: "نيوزيلندا",
  MX: "المكسيك",
  ZA: "جنوب أفريقيا",
  AR: "الأرجنتين",
  TH: "تايلاند",
  MY: "ماليزيا",
  ID: "إندونيسيا",
  PH: "الفلبين",
  VN: "فيتنام",
  PK: "باكستان",
  BD: "بنغلاديش",
};

export function getCountryName(code: string): string {
  return countryNames[code.toUpperCase()] || code;
}

export function getFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (code.length !== 2) return "";
  const codePoints = code.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

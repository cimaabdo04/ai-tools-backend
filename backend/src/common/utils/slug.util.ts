import slugify from 'slugify';

export function generateSlug(name: string, suffix?: string): string {
  let slug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  if (suffix) {
    slug = `${slug}-${suffix}`;
  }

  return slug;
}

export function generateUniqueSlug(name: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return generateSlug(name, `${timestamp}${random}`);
}

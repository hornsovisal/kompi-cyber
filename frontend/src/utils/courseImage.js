/**
 * Utility functions for course cover image handling
 */

/**
 * Convert course title to slug format for Supabase folder lookup
 * Examples:
 *   "Introduction to Cybersecurity" -> "introduction-to-cybersecurity"
 *   "Network Security Basics" -> "network-security-basics"
 *   "Web Application Security" -> "web-application-security"
 */
export function titleToSlug(title) {
  if (!title) return null;

  return String(title)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove special characters
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Get course cover image URL from Supabase
 * Priority:
 * 1. Use course.title converted to slug (PRIMARY - matches Supabase folder names)
 * 2. Use course.slug if available
 * 3. Use pattern-based fallback mapping
 */
export function getCourseCoverUrl(course, supabaseUrl, bucket) {
  if (!course) return null;

  // PRIORITY 1: Use database cover_image_url if it's a FULL Supabase URL
  const coverImageUrl = course.cover_image_url;
  if (coverImageUrl && /^https:\/\/.*supabase\.co/i.test(coverImageUrl)) {
    return coverImageUrl;
  }

  // PRIORITY 2: Build Supabase URL using course TITLE converted to slug
  // This matches the Supabase folder naming convention
  const titleSlug = titleToSlug(course.title);
  if (titleSlug) {
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/lesson/${titleSlug}/cover.svg`;
  }

  // PRIORITY 3: Fallback to course.slug if available
  if (course.slug) {
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/lesson/${course.slug}/cover.svg`;
  }

  return null;
}

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
 * Get course cover image URL directly from Supabase storage using signed URLs.
 *
 * Images are loaded directly from Supabase storage using signed URLs to avoid
 * CORS issues with Railway's strict cross-origin-resource-policy headers.
 *
 * Priority:
 * 1. Use course.title converted to slug (PRIMARY - matches Supabase folder names)
 * 2. Use course.slug if available
 */
export function getCourseCoverUrl(course) {
  if (!course) return null;

  // Supabase configuration
  const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL ||
    "https://xmmcotqzfhicafwblsdr.supabase.co";
  const BUCKET = "upload";

  // PRIORITY 1: Build Supabase signed URL using course TITLE converted to slug
  // This matches the Supabase folder naming convention
  const titleSlug = titleToSlug(course.title);
  if (titleSlug) {
    return `${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/lesson/${titleSlug}/cover.svg`;
  }

  // PRIORITY 2: Fallback to course.slug if available
  if (course.slug) {
    return `${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/lesson/${course.slug}/cover.svg`;
  }

  return null;
}

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

import { API_BASE_URL } from "../config/api";

/**
 * Get course cover image URL via backend proxy endpoint.
 *
 * Images are served through /api/courses/cover/:slug on the backend
 * instead of trying to access Supabase directly. The backend handles
 * fetching from Supabase and returns the image with proper CORS headers.
 *
 * Priority:
 * 1. Use course.title converted to slug (PRIMARY - matches Supabase folder names)
 * 2. Use course.slug if available
 */
export function getCourseCoverUrl(course) {
  if (!course) return null;

  // PRIORITY 1: Build proxy URL using course TITLE converted to slug
  // This matches the Supabase folder naming convention
  const titleSlug = titleToSlug(course.title);
  if (titleSlug) {
    return `${API_BASE_URL}/api/courses/cover/${titleSlug}`;
  }

  // PRIORITY 2: Fallback to course.slug if available
  if (course.slug) {
    return `${API_BASE_URL}/api/courses/cover/${course.slug}`;
  }

  return null;
}

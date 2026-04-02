/**
 * Utility functions for course cover image handling
 */

import { API_BASE_URL } from "../config/api";

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
 * Get course cover image URL via the backend proxy endpoint.
 *
 * Images are served through /api/courses/cover/:slug on the Railway backend
 * rather than directly from Supabase. This ensures the backend can attach the
 * `Cross-Origin-Resource-Policy: cross-origin` header that browsers require
 * for cross-origin image loads, preventing OpaqueResponseBlocking errors.
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

/**
 * Slug Generator Utility
 * Generates URL-safe, unique slugs for security and readability
 * Prevents IDOR (Insecure Direct Object Reference) attacks
 */

const crypto = require("crypto");

/**
 * Generate a unique random slug
 * Format: 32 character hexadecimal string (URL-safe)
 * Example: "a7f3e9b2c4d1f8e6k9p2q5r8s1t4v7w0"
 * @returns {string} Random slug
 */
function generateSlug() {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Generate a slug from an ID with timestamp
 * More deterministic but still unique
 * @param {number} id - The numeric ID
 * @returns {string} Hash-based slug
 */
function generateSlugFromId(id) {
  const hash = crypto
    .createHash("sha256")
    .update(`${id}-${Date.now()}-${Math.random()}`)
    .digest("hex");
  return hash.substring(0, 24);
}

/**
 * Validate slug format (hexadecimal, reasonable length)
 * @param {string} slug - The slug to validate
 * @returns {boolean}
 */
function isValidSlug(slug) {
  if (!slug || typeof slug !== "string") return false;
  // Allow 24-32 character hex strings or custom slugs with letters/numbers/hyphens
  return /^[a-z0-9-]{16,64}$/i.test(slug);
}

/**
 * Convert title to URL-friendly slug
 * Example: "Network Security 101" → "network-security-101"
 * @param {string} title
 * @returns {string}
 */
function slugify(title) {
  if (!title) return generateSlug();

  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .slice(0, 50); // Limit length
}

module.exports = {
  generateSlug,
  generateSlugFromId,
  isValidSlug,
  slugify,
};

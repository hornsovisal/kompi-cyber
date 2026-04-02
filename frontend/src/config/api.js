/**
 * Central API configuration.
 *
 * In production (Vercel) VITE_API_URL must be set to the Railway backend URL:
 *   https://kompi-cyber.up.railway.app
 *
 * During local development the Vite dev-server proxy forwards /api/* to
 * localhost:5000, so an empty string keeps relative URLs working.
 */
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Configure axios to suppress expected 404 errors
 * These occur when fetching quiz attempts for lessons with no attempts yet
 */
const originalError = console.error;
const originalWarn = console.warn;

// Suppress specific axios 404 errors that are expected/handled
const suppressedPaths = ["/api/quizzes/lesson"];

console.error = (...args) => {
  // Check if this is an axios error for an expected 404
  const errorStr = args[0]?.toString?.() || String(args[0]);

  if (
    errorStr.includes("404") &&
    suppressedPaths.some((path) => errorStr.includes(path))
  ) {
    // Silently ignore expected 404s
    return;
  }

  // Otherwise log normally
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const warnStr = args[0]?.toString?.() || String(args[0]);

  if (
    warnStr.includes("404") &&
    suppressedPaths.some((path) => warnStr.includes(path))
  ) {
    return;
  }

  originalWarn.apply(console, args);
};

/**
 * Central API configuration.
 *
 * In production (Vercel) VITE_API_URL must be set to the Railway backend URL:
 *   https://kompi-cyber.up.railway.app
 *
 * During local development the Vite dev-server proxy forwards /api/* to
 * localhost:5000, so an empty string keeps relative URLs working.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";

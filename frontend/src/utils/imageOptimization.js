/**
 * Image optimization utilities for better performance
 */

/**
 * Generate optimized image URL with query parameters
 * Useful for services like Cloudinary or Supabase that support image transformation
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url) return null;

  // Skip optimization for base64 or data URLs
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  const {
    width = null,
    height = null,
    quality = 80, // Default quality for compression
    format = "webp", // Modern format for better compression
  } = options;

  // For Supabase storage URLs, add image transformation parameters
  if (url.includes("supabase.co")) {
    const params = new URLSearchParams();
    if (width) params.append("width", width);
    if (height) params.append("height", height);
    if (quality) params.append("quality", quality);
    if (format && !url.endsWith(".svg")) params.append("format", format);

    const connector = url.includes("?") ? "&" : "?";
    return `${url}${connector}${params.toString()}`;
  }

  return url;
}

/**
 * Create srcset for responsive images
 * Generates multiple image sizes for different screen resolutions
 */
export function generateSrcset(url, widths = [320, 640, 1024]) {
  if (!url || url.endsWith(".svg")) return null;

  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedImageUrl(url, { width, quality: 80 });
      return `${optimizedUrl} ${width}w`;
    })
    .join(", ");
}

/**
 * Preload critical images for better perceived performance
 */
export function preloadImage(url) {
  if (!url) return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Create an image element with intersection observer for lazy loading
 */
export function setupLazyLoading() {
  const imageElements = document.querySelectorAll("[data-lazy-src]");

  if (!window.IntersectionObserver) {
    // Fallback for older browsers
    imageElements.forEach((img) => {
      const src = img.dataset.lazySrc;
      if (src) {
        img.src = src;
        img.removeAttribute("data-lazy-src");
      }
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.lazySrc;
          if (src) {
            img.src = src;
            img.removeAttribute("data-lazy-src");
            obs.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: "50px", // Start loading 50px before image is visible
    },
  );

  imageElements.forEach((img) => observer.observe(img));

  return observer;
}

/**
 * Check if WebP is supported
 */
export function isWebPSupported() {
  const canvas =
    typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!canvas) return false;

  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").includes("webp");
}

/**
 * Generate fallback URL with proper error handling
 */
export function getImageUrlWithFallback(primaryUrl, fallbackUrl = null) {
  if (!primaryUrl) return fallbackUrl;

  // For Supabase, ensure URL is properly formatted
  if (primaryUrl.includes("supabase.co")) {
    // Ensure it has the proper storage path
    if (!primaryUrl.includes("/storage/v1/")) {
      return fallbackUrl;
    }
  }

  return primaryUrl;
}

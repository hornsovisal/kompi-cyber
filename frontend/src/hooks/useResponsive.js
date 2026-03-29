import { useState, useEffect } from "react";

/**
 * Custom hook for responsive design
 * Returns breakpoint information and helpers
 *
 * Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
 */
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: typeof window !== "undefined" ? window.innerWidth : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setBreakpoint({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
      });
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
};

/**
 * Hook to check if screen matches a specific breakpoint
 */
export const useBreakpoint = (breakpointSize) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      "2xl": 1536,
    };

    const size = breakpoints[breakpointSize] || 768;

    const handleResize = () => {
      setMatches(window.innerWidth >= size);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpointSize]);

  return matches;
};

/**
 * Hook to get current screen width
 */
export const useScreenWidth = () => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

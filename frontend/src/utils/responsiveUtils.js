/**
 * Responsive Design Utilities - OOP Pattern
 * Centralized responsive patterns and helper functions
 */

export class ResponsiveUtils {
  /**
   * Get responsive padding classes
   */
  static getPadding(
    small = "px-4 py-4",
    medium = "px-6 py-6 sm:px-8 sm:py-8",
    large = "px-8 py-8 md:px-12 md:py-12",
  ) {
    return `${small} md:${medium} lg:${large}`;
  }

  /**
   * Get responsive text size
   */
  static getTextSize(type = "body") {
    const sizes = {
      h1: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold",
      h2: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold",
      h3: "text-xl sm:text-2xl md:text-3xl font-bold",
      h4: "text-lg sm:text-xl md:text-2xl font-semibold",
      body: "text-base sm:text-lg md:text-lg",
      small: "text-sm sm:text-base",
      xs: "text-xs sm:text-sm",
    };
    return sizes[type] || sizes.body;
  }

  /**
   * Get responsive gap
   */
  static getGap(small = "gap-2", medium = "md:gap-4", large = "lg:gap-6") {
    return `${small} ${medium} ${large}`;
  }

  /**
   * Get responsive grid
   */
  static getGrid(mobile = 1, tablet = 2, desktop = 3) {
    const gridCols = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      6: "grid-cols-6",
    };
    return `${gridCols[mobile]} md:${gridCols[tablet]} lg:${gridCols[desktop]}`;
  }

  /**
   * Get responsive width
   */
  static getWidth(maxWidth = "max-w-7xl") {
    return `w-full ${maxWidth} mx-auto`;
  }

  /**
   * Get responsive container
   */
  static getContainer() {
    return `${this.getWidth()} ${this.getPadding("px-4", "px-6 sm:px-8", "px-12")}`;
  }

  /**
   * Get responsive breakpoint value
   */
  static getBreakpoint(name) {
    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      "2xl": 1536,
    };
    return breakpoints[name] || 768;
  }

  /**
   * Combine responsive classes
   */
  static combine(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  /**
   * Get responsive flex direction
   */
  static getFlexDirection(mobile = "flex-col", tablet = "md:flex-row") {
    return `${mobile} ${tablet}`;
  }

  /**
   * Get responsive display
   */
  static getDisplay(
    mobile = "block",
    tablet = "md:hidden",
    desktop = "lg:block",
  ) {
    return `${mobile} ${tablet} ${desktop}`;
  }

  /**
   * Get responsive spacing
   */
  static getSpacing(property = "my", small = 4, medium = 6, large = 8) {
    const props = {
      px: ["px", "sm:px", "md:px", "lg:px"],
      py: ["py", "sm:py", "md:py", "lg:py"],
      mx: ["mx", "sm:mx", "md:mx", "lg:mx"],
      my: ["my", "sm:my", "md:my", "lg:my"],
      p: ["p", "sm:p", "md:p", "lg:p"],
      m: ["m", "sm:m", "md:m", "lg:m"],
    };

    const prefix = props[property]?.[0] || property;
    return `${prefix}-${small} sm:${prefix}-${medium} lg:${prefix}-${large}`;
  }
}

/**
 * MobileFirst - Class for mobile-first responsive patterns
 */
export class MobileFirst {
  static hideOnMobile(mdClass = "md:block") {
    return `hidden ${mdClass}`;
  }

  static showOnMobile(mdClass = "md:hidden") {
    return `block ${mdClass}`;
  }

  static responsiveColumns(
    mobile = "grid-cols-1",
    tablet = "sm:grid-cols-2",
    desktop = "lg:grid-cols-3",
  ) {
    return `grid ${mobile} ${tablet} ${desktop}`;
  }

  static responsiveText(
    mobile = "text-base",
    tablet = "sm:text-lg",
    desktop = "lg:text-xl",
  ) {
    return `${mobile} ${tablet} ${desktop}`;
  }
}

/**
 * Responsive padding preset
 */
export const responsivePadding = {
  xs: "px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4",
  sm: "px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6",
  md: "px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10",
  lg: "px-8 py-8 sm:px-12 sm:py-12 md:px-16 md:py-16",
  xl: "px-12 py-12 sm:px-16 sm:py-16 md:px-20 md:py-20",
};

/**
 * Responsive gap preset
 */
export const responsiveGap = {
  xs: "gap-2 sm:gap-3 md:gap-4",
  sm: "gap-3 sm:gap-4 md:gap-5",
  md: "gap-4 sm:gap-6 md:gap-8",
  lg: "gap-6 sm:gap-8 md:gap-12",
  xl: "gap-8 sm:gap-12 md:gap-16",
};

/**
 * Responsive text size preset
 */
export const responsiveText = {
  "2xs": "text-xs sm:text-xs md:text-sm",
  xs: "text-xs sm:text-sm md:text-base",
  sm: "text-sm sm:text-base md:text-lg",
  base: "text-base sm:text-lg md:text-xl",
  lg: "text-lg sm:text-xl md:text-2xl",
  xl: "text-xl sm:text-2xl md:text-3xl",
  "2xl": "text-2xl sm:text-3xl md:text-4xl",
  "3xl": "text-3xl sm:text-4xl md:text-5xl",
  "4xl": "text-4xl sm:text-5xl md:text-6xl",
};

export default {
  ResponsiveUtils,
  MobileFirst,
  responsivePadding,
  responsiveGap,
  responsiveText,
};

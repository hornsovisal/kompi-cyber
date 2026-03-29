/**
 * Modular Theme System for Dark/Light Modes
 * OOP-based theme management
 */

export class ThemeManager {
  constructor(isDark = true) {
    this.isDark = isDark;
    this.themes = {
      dark: {
        shell: "bg-[#192841] text-white",
        nav: "bg-[#192841]/80 border-[#FFA500]/20",
        card: "bg-white/5 border-[#FFA500]/20 text-white",
        button: "bg-[#FFA500] text-white hover:bg-orange-400",
        secondaryButton:
          "bg-white/10 border border-white/20 text-white hover:bg-white/20",
        input:
          "bg-white/10 border border-white/20 text-white placeholder-gray-400",
        muted: "text-gray-400",
        soft: "text-gray-300",
        section: "bg-gradient-to-b from-[#192841] to-[#0f1a2e]",
        border: "border-[#FFA500]/20",
        hover: "hover:text-[#FFA500]",
        accent: "#FFA500",
      },
      light: {
        shell: "bg-gradient-to-b from-white to-gray-50 text-[#1f2a44]",
        nav: "bg-white/95 border-orange-200 shadow-sm",
        card: "bg-gradient-to-br from-white to-orange-50 border-orange-200 text-[#1f2a44] shadow-sm",
        button:
          "bg-gradient-to-r from-[#FFA500] to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 shadow-md",
        secondaryButton:
          "bg-orange-100 border border-orange-300 text-[#d97706] hover:bg-orange-200",
        input:
          "bg-white border-orange-300 text-[#1f2a44] placeholder-gray-400 shadow-sm focus:ring-orange-500",
        muted: "text-gray-600",
        soft: "text-gray-700",
        section: "bg-gradient-to-b from-gray-50 via-orange-50 to-white",
        border: "border-orange-200",
        hover: "hover:text-[#FFA500]",
        accent: "#FFA500",
      },
    };
  }

  /**
   * Get current theme colors
   */
  getTheme() {
    return this.isDark ? this.themes.dark : this.themes.light;
  }

  /**
   * Get specific color
   */
  getColor(key) {
    return this.getTheme()[key] || "";
  }

  /**
   * Toggle theme
   */
  toggle() {
    this.isDark = !this.isDark;
    return this.isDark;
  }

  /**
   * Set theme
   */
  setDark(value) {
    this.isDark = value;
  }

  /**
   * Get all CSS classes for a component
   */
  getComponentClasses(componentType) {
    const theme = this.getTheme();
    const components = {
      button: `px-4 py-2 rounded-lg font-semibold transition ${theme.button}`,
      secondaryButton: `px-4 py-2 rounded-lg font-semibold border transition ${theme.secondaryButton}`,
      input: `w-full px-4 py-2 rounded-lg border transition outline-none ${theme.input}`,
      card: `rounded-xl border p-6 backdrop-blur-sm ${theme.card}`,
      section: `w-full py-16 md:py-24 ${theme.section}`,
      navItem: `transition duration-300 ${theme.hover}`,
    };

    return components[componentType] || "";
  }
}

/**
 * Context Hook for Theme (to be used with React Context)
 */
export const useTheme = (isDarkMode) => {
  const themeManager = new ThemeManager(isDarkMode);
  return themeManager;
};

export default ThemeManager;

import { useState } from "react";
import { useResponsive, useBreakpoint } from "../../hooks/useResponsive";
import { Menu, X } from "lucide-react";

/**
 * Responsive Navigation Component
 * OOP-based with modular design
 */
export const ResponsiveNav = ({
  brand,
  navItems = [],
  rightActions = null,
  sticky = true,
  accentColor = "#FFA500",
  onNavClick = () => {},
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile } = useResponsive();

  const stickyClass = sticky ? "fixed left-0 right-0 top-0 z-50" : "";

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={`border-b border-[#FFA500]/20 bg-[#192841]/80 px-4 py-4 shadow-2xl backdrop-blur-md sm:px-6 md:px-12 ${stickyClass}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex-shrink-0 text-2xl font-bold text-[#FFA500]">
            {brand}
          </div>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-8 font-medium md:flex">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onNavClick(item.id);
                  item.onClick?.();
                }}
                className="transition duration-300 hover:text-[#FFA500]"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden items-center gap-4 md:flex">
            {rightActions}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isMobile && (
          <div className="mt-4 space-y-3 border-t border-[#FFA500]/20 pt-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onNavClick(item.id);
                  item.onClick?.();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 transition duration-300 hover:text-[#FFA500]"
              >
                {item.label}
              </button>
            ))}
            {rightActions && (
              <div className="border-t border-[#FFA500]/20 pt-4">
                {rightActions}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Spacer for sticky nav */}
      {sticky && <div className="h-20" />}
    </>
  );
};

/**
 * Responsive Grid Layout
 */
export const ResponsiveGrid = ({ children, minColWidth = 300 }) => {
  const { isMobile, isTablet } = useResponsive();

  const colsClass = isMobile
    ? "grid-cols-1"
    : isTablet
      ? "grid-cols-2"
      : "grid-cols-3";

  return <div className={`grid ${colsClass} gap-6`}>{children}</div>;
};

/**
 * Responsive Hero Section
 */
export const HeroSection = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  image,
  backgroundGradient = "from-[#192841] to-[#0f1a2e]",
}) => {
  const { isMobile } = useResponsive();

  return (
    <div
      className={`relative min-h-screen w-full bg-gradient-to-b ${backgroundGradient} py-12 sm:py-16 md:py-24 lg:py-32`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          {/* Text Content */}
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
              {title}
            </h1>

            {subtitle && (
              <p className="text-lg text-gray-300 sm:text-xl">{subtitle}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row">
              {primaryAction && (
                <button className="rounded-lg bg-[#FFA500] px-6 py-3 font-semibold text-white transition hover:bg-orange-400">
                  {primaryAction.label}
                </button>
              )}
              {secondaryAction && (
                <button className="rounded-lg border border-[#FFA500]/40 bg-[#FFA500]/10 px-6 py-3 font-semibold text-[#FFA500] transition hover:bg-[#FFA500]/20">
                  {secondaryAction.label}
                </button>
              )}
            </div>
          </div>

          {/* Image */}
          {image && !isMobile && (
            <div className="flex items-center justify-center">{image}</div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Responsive Footer
 */
export const ResponsiveFooter = ({ sections = [] }) => {
  const { isMobile } = useResponsive();

  return (
    <footer className="border-t border-[#FFA500]/20 bg-[#192841]/50 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
        <div
          className={`grid gap-8 ${isMobile ? "grid-cols-1" : "grid-cols-" + sections.length}`}
        >
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="mb-4 font-bold text-white">{section.title}</h3>
              <ul className="space-y-2">
                {section.links?.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 transition hover:text-[#FFA500]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-[#FFA500]/20 pt-8 text-center text-gray-400">
          <p>&copy; 2026 KOMPI-CYBER. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default {
  ResponsiveNav,
  ResponsiveGrid,
  HeroSection,
  ResponsiveFooter,
};

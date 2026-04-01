import { forwardRef } from "react";

/**
 * Base Button Component - Responsive and Modular
 * Uses OOP pattern with variants and composition
 */
export const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled = false,
      className = "",
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-[#FFA500] text-white hover:bg-orange-400 dark:bg-[#FFA500] dark:hover:bg-orange-400",
      secondary:
        "bg-white/10 border border-white/20 text-white hover:bg-white/20 dark:border-white/20",
      danger: "bg-red-500 text-white hover:bg-red-600",
      ghost: "text-white hover:bg-white/10 dark:hover:bg-white/10",
    };

    const sizes = {
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const baseClasses =
      "rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClass = variants[variant] || variants.primary;
    const sizeClass = sizes[size] || sizes.md;
    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

/**
 * Base Card Component - Responsive Container
 */
export const Card = forwardRef(
  ({ children, className = "", hoverable = false, ...props }, ref) => {
    const hoverClass = hoverable
      ? "hover:shadow-lg hover:scale-105 transition transform"
      : "";
    return (
      <div
        ref={ref}
        className={`rounded-xl border border-[#FFA500]/20 bg-white/5 p-6 backdrop-blur-sm ${hoverClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

/**
 * Base Input Component - Responsive Form Field
 */
export const Input = forwardRef(
  (
    {
      type = "text",
      placeholder = "",
      error = false,
      helperText = "",
      className = "",
      ...props
    },
    ref,
  ) => {
    const errorClass = error ? "border-red-500" : "border-white/20";
    return (
      <div className="w-full">
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-white/10 px-4 py-2 text-white outline-none transition placeholder-gray-400 focus:border-[#FFA500] ${errorClass} ${className}`}
          {...props}
        />
        {helperText && (
          <p
            className={`mt-1 text-sm ${error ? "text-red-500" : "text-gray-400"}`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

/**
 * Base Container - Responsive layout wrapper
 */
export const Container = ({ children, className = "", ...props }) => (
  <div
    className={`mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 ${className}`}
    {...props}
  >
    {children}
  </div>
);

/**
 * Base Section - Responsive section with padding
 */
export const Section = ({ children, className = "", id = "" }) => (
  <section
    id={id}
    className={`w-full bg-gradient-to-b from-[#192841] to-[#0f1a2e] py-12 sm:py-16 md:py-20 lg:py-24 ${className}`}
  >
    <Container>{children}</Container>
  </section>
);

/**
 * Grid Component - Responsive grid system
 */
export const Grid = ({
  children,
  cols = 1,
  md = 2,
  lg = 3,
  gap = 4,
  className = "",
}) => {
  const gapClass = {
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };

  return (
    <div
      className={`grid grid-cols-${cols} md:grid-cols-${md} lg:grid-cols-${lg} ${gapClass[gap] || "gap-4"} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Flex Component - Responsive flex layout
 */
export const Flex = ({
  children,
  direction = "row",
  justify = "start",
  items = "center",
  gap = 4,
  className = "",
  responsive = true,
  ...props
}) => {
  const directionClass = direction === "column" ? "flex-col" : "flex-row";
  const justifyClass = {
    start: "justify-start",
    center: "justify-center",
    between: "justify-between",
    end: "justify-end",
  };
  const itemsClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
  };
  const gapClass = {
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };

  return (
    <div
      className={`flex ${directionClass} ${justifyClass[justify]} ${itemsClass[items]} ${gapClass[gap]} ${responsive ? "flex-wrap" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

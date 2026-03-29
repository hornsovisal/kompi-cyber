# Frontend Architecture - Responsive & Modular System

## Overview

This refactoring implements a comprehensive responsive and modular frontend architecture following OOP principles and React best practices.

## 🏗️ Architecture Structure

```
src/
├── components/
│   ├── base/              # Reusable base components
│   │   └── index.js       # Button, Card, Input, Container, Section, Grid, Flex
│   ├── layouts/           # Responsive layout components
│   │   └── ResponsiveLayout.jsx  # ResponsiveNav, HeroSection, Footer
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── [existing components]
├── hooks/
│   ├── useResponsive.js   # useResponsive, useBreakpoint, useScreenWidth
│   ├── useAuth.js
│   └── useInstructorAPI.js
├── utils/
│   ├── themeManager.js    # ThemeManager class (OOP-based)
│   ├── responsiveUtils.js # ResponsiveUtils, MobileFirst classes
│   ├── auth.js
│   └── courseTypeHelpers.js
├── pages/
│   ├── Home.jsx
│   ├── Dashboard.jsx
│   └── [existing pages]
└── index.css
```

## 📱 Responsive Hooks

### `useResponsive()`

Returns breakpoint information and device type.

```jsx
import { useResponsive } from "@/hooks/useResponsive";

function MyComponent() {
  const { isMobile, isTablet, isDesktop, width } = useResponsive();

  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

### `useBreakpoint(size)`

Check if screen matches/exceeds breakpoint.

```jsx
const isDesktop = useBreakpoint("lg"); // true if screen >= 1024px
```

### `useScreenWidth()`

Get current screen width.

```jsx
const width = useScreenWidth();
```

## 🎨 Theme System

### ThemeManager Class (OOP-based)

Centralized theme management with dark/light modes.

```jsx
import { ThemeManager, useTheme } from "@/utils/themeManager";

// Usage in component
function MyComponent({ isDarkMode }) {
  const theme = useTheme(isDarkMode);

  return (
    <div className={theme.getColor("shell")}>
      <button className={theme.getComponentClasses("button")}>Click me</button>
    </div>
  );
}

// Available methods:
// - getTheme() → returns all colors for current theme
// - getColor(key) → returns specific color
// - getComponentClasses(componentType) → returns component styles
// - toggle() → switch between dark/light
// - setDark(value) → explicitly set theme
```

## 🧩 Base Components (Modular & Reusable)

### Button

```jsx
import { Button } from "@/components/base";

// Variants: primary, secondary, danger, ghost
// Sizes: sm, md, lg
<Button variant="primary" size="md" fullWidth>
  Click me
</Button>;
```

### Card

```jsx
import { Card } from "@/components/base";

<Card hoverable className="space-y-4">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>;
```

### Input

```jsx
import { Input } from "@/components/base";

<Input
  type="email"
  placeholder="Enter email"
  error={hasError}
  helperText="Error message"
/>;
```

### Container

```jsx
import { Container } from "@/components/base";

<Container>
  {/* Content automatically centered with responsive padding */}
</Container>;
```

### Section

```jsx
import { Section } from "@/components/base";

<Section id="hero">{/* Content with responsive spacing */}</Section>;
```

### Grid & Flex

```jsx
import { Grid, Flex } from '@/components/base';

<Grid cols={1} md={2} lg={3} gap={4}>
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</Grid>

<Flex direction="row" justify="between" items="center" gap={4}>
  <div>Left</div>
  <div>Right</div>
</Flex>
```

## 📐 Responsive Layout Components

### ResponsiveNav

```jsx
import { ResponsiveNav } from "@/components/layouts/ResponsiveLayout";

<ResponsiveNav
  brand="KOMPI-CYBER"
  navItems={[
    { id: "home", label: "Home", onClick: () => {} },
    { id: "about", label: "About", onClick: () => {} },
  ]}
  rightActions={<LoginButton />}
  sticky={true}
/>;
```

### HeroSection

```jsx
import { HeroSection } from "@/components/layouts/ResponsiveLayout";

<HeroSection
  title="Welcome to KOMPI-CYBER"
  subtitle="Learn cybersecurity from experts"
  primaryAction={{ label: "Get Started" }}
  secondaryAction={{ label: "Learn More" }}
/>;
```

### ResponsiveFooter

```jsx
import { ResponsiveFooter } from "@/components/layouts/ResponsiveLayout";

<ResponsiveFooter
  sections={[
    { title: "Product", links: [{ label: "Features", href: "#" }] },
    { title: "Company", links: [{ label: "About", href: "#" }] },
  ]}
/>;
```

## 🛠️ Responsive Utilities

### ResponsiveUtils Class

```jsx
import { ResponsiveUtils, MobileFirst, responsivePadding } from '@/utils/responsiveUtils';

// Responsive padding
const padding = ResponsiveUtils.getPadding();

// Responsive text
const textSize = ResponsiveUtils.getTextSize('h1');

// Responsive grid
const grid = ResponsiveUtils.getGrid(1, 2, 3); // mobile, tablet, desktop

// Responsive width
const width = ResponsiveUtils.getWidth('max-w-6xl');

// Responsive container
const container = ResponsiveUtils.getContainer();

// Mobile-first patterns
MobileFirst.hideOnMobile('md:block'); // hidden by default, show on md+
MobileFirst.showOnMobile('md:hidden'); // visible on mobile, hide on md+

// Preset values
<div className={responsivePadding.md}> {/* px-6 py-6 sm:px-8 ... */}
<div className={responsiveGap.md}> {/* gap-4 sm:gap-6 md:gap-8 */}
<div className={responsiveText.xl}> {/* text-xl sm:text-2xl md:text-3xl */}
```

## 📋 Responsive Breakpoints

```
sm: 640px   (small devices)
md: 768px   (tablets)
lg: 1024px  (desktops)
xl: 1280px  (large desktops)
2xl: 1536px (extra large)
```

## ✨ Best Practices

### 1. Use Responsive Hooks

```jsx
// ❌ Don't use window.innerWidth directly
const width = window.innerWidth;

// ✅ Use responsive hooks
const { width } = useResponsive();
```

### 2. Use Base Components

```jsx
// ❌ Don't recreate buttons
<button className="px-4 py-2 bg-blue-500">Click</button>

// ✅ Use reusable base components
<Button variant="primary">Click</Button>
```

### 3. Use Theme Manager

```jsx
// ❌ Don't hardcode colors
<div className="bg-blue-500">Text</div>;

// ✅ Use theme system
const theme = useTheme(isDark);
<div className={theme.getColor("shell")}>Text</div>;
```

### 4. Mobile-First Design

```jsx
// ✅ Write mobile classes first, then add responsive classes
<div className="text-sm sm:text-base md:text-lg">
  Mobile-first responsive text
</div>

// ✅ Use MobileFirst utilities
<div className={MobileFirst.hideOnMobile('md:block')}>
  Desktop only
</div>
```

### 5. Use Responsive Utils

```jsx
// ✅ Use utility classes for consistent spacing
<div className={responsivePadding.md}>
  Content with responsive padding
</div>

// ✅ Use ResponsiveUtils for complex patterns
<div className={ResponsiveUtils.getContainer()}>
  Centered, responsive container
</div>
```

## 🔄 Migration Guide

### Converting Existing Components to Responsive

1. **Replace hardcoded classes with hooks:**

   ```jsx
   // Before
   const isMobile = window.innerWidth < 768;

   // After
   const { isMobile } = useResponsive();
   ```

2. **Use base components:**

   ```jsx
   // Before
   <button className="px-4 py-2 bg-blue-500 rounded">Click</button>

   // After
   <Button variant="primary">Click</Button>
   ```

3. **Use theme manager:**

   ```jsx
   // Before
   className={`${dark ? 'bg-slate-900' : 'bg-white'}`}

   // After
   className={theme.getColor('shell')}
   ```

4. **Apply responsive spacing:**

   ```jsx
   // Before
   className="px-4 py-4"

   // After
   className={responsivePadding.md}
   ```

## 📦 Component Variants

### Button Variants

- **primary** - Main action button
- **secondary** - Secondary action button
- **danger** - Destructive action button
- **ghost** - Subtle button

### Button Sizes

- **sm** - Small button
- **md** - Medium button (default)
- **lg** - Large button

## 🚀 Performance Tips

1. Use responsive hooks to avoid layout shifts
2. Memoize components with `forwardRef` when needed
3. Use CSS classes instead of inline styles
4. Leverage Tailwind's responsive prefixes (sm:, md:, lg:, etc.)

## 📚 Files Created/Modified

### New Files:

- `src/hooks/useResponsive.js` - Responsive hooks
- `src/utils/themeManager.js` - Theme management
- `src/utils/responsiveUtils.js` - Responsive utilities
- `src/components/base/index.js` - Base components
- `src/components/layouts/ResponsiveLayout.jsx` - Layout components

### Next Steps:

1. Update existing pages to use new components
2. Convert all components to use responsive utilities
3. Implement theme context provider for app-wide theme
4. Add more specialized components as needed

---

## 📖 Documentation

For more information on each component, refer to inline JSDoc comments in source files.

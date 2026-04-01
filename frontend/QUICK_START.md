# Quick Start Guide - Responsive Frontend System

## 🎯 5-Minute Overview

You now have a complete **responsive + modular** frontend system ready to use. Here's what was created and how to use it.

## 📦 What's New

### 1. **Responsive Hooks** (auto-detect screen size)

```jsx
import { useResponsive } from "@/hooks/useResponsive";

const { isMobile, isTablet, isDesktop, width } = useResponsive();
// Shows/hides components based on screen size automatically
```

### 2. **Base Components** (reusable UI elements)

```jsx
import { Button, Card, Input, Grid, Container } from '@/components/base';

<Button variant="primary">Click me</Button>
<Card hoverable>Content here</Card>
<Grid cols={1} md={2} lg={3}>{items}</Grid>
```

### 3. **Theme System** (dark/light modes)

```jsx
import { useTheme } from '@/utils/themeManager';

const theme = useTheme(isDark);
<div className={theme.getColor('shell')}> {/* Entire app themed */}
```

### 4. **Responsive Utils** (spacing, text, layouts)

```jsx
import { responsiveText, responsivePadding } from '@/utils/responsiveUtils';

<h1 className={responsiveText['3xl']}>  {/* Scales on all devices */}
<div className={responsivePadding.lg}>  {/* Padding adjusts for screen size */}
```

## 🚀 3 Simple Steps to Use

### Step 1: Import Hooks

```jsx
import { useResponsive } from '@/hooks/useResponsive';

function MyPage() {
  const { isMobile } = useResponsive();
```

### Step 2: Replace Components

```jsx
// ❌ Old
<button className="px-4 py-2 bg-blue">Click</button>

// ✅ New
<Button variant="primary">Click</Button>
```

### Step 3: Apply Responsive Styles

```jsx
// ❌ Old
<h1 className="text-4xl md:text-5xl">Title</h1>

// ✅ New (using preset)
<h1 className={responsiveText['2xl']}>Title</h1>
```

## 📋 Complete Component Reference

### Base Components

```jsx
import {
  Button, // <Button variant="primary" size="md">
  Card, // <Card hoverable>
  Input, // <Input type="email" error={false} />
  Container, // <Container> max-width wrapper
  Section, // <Section> full-width section
  Grid, // <Grid cols={1} md={2} lg={3}>
  Flex, // <Flex direction="row" justify="between">
} from "@/components/base";
```

### Layout Components

```jsx
import {
  ResponsiveNav, // Navigation with mobile menu
  HeroSection, // Hero with image + text
  ResponsiveGrid, // Auto-responsive grid
  ResponsiveFooter, // Footer with columns
} from "@/components/layouts/ResponsiveLayout";
```

### Hooks

```jsx
import {
  useResponsive, // Get breakpoint info
  useBreakpoint, // Check specific breakpoint
  useScreenWidth, // Get width value
} from "@/hooks/useResponsive";
```

### Utilities

```jsx
import {
  ResponsiveUtils, // Static helper class
  MobileFirst, // Mobile-first patterns
  responsiveText, // Text size presets
  responsivePadding, // Padding presets
  responsiveGap, // Gap presets
} from "@/utils/responsiveUtils";
```

## 💡 Common Use Cases

### Responsive Navigation

```jsx
<ResponsiveNav
  brand="KOMPI-CYBER"
  navItems={[
    { id: "home", label: "Home" },
    { id: "courses", label: "Courses" },
  ]}
  rightActions={<Button>Login</Button>}
/>
```

### Course Grid (Auto-responsive)

```jsx
<Grid cols={1} md={2} lg={3} gap={6}>
  {courses.map((course) => (
    <Card key={course.id} hoverable>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <Button fullWidth>Enroll</Button>
    </Card>
  ))}
</Grid>
```

### Responsive Form

```jsx
<Container>
  <Card className="w-full max-w-md">
    <h2 className={responsiveText.lg}>Login</h2>
    <Input placeholder="Email" type="email" />
    <Input placeholder="Password" type="password" />
    <Button fullWidth variant="primary">
      Sign In
    </Button>
  </Card>
</Container>
```

### Conditional Rendering

```jsx
function MyPage() {
  const { isMobile, isDesktop } = useResponsive();

  return (
    <>
      {isMobile && <MobileLayout />}
      {isDesktop && <DesktopLayout />}
    </>
  );
}
```

## 🎨 Button Variants & Sizes

### Variants

```jsx
<Button variant="primary">   {/* Main action - orange */}
<Button variant="secondary"> {/* Secondary - white/10 */}
<Button variant="danger">    {/* Destructive - red */}
<Button variant="ghost">     {/* Subtle - no background */}
```

### Sizes

```jsx
<Button size="sm">   {/* Small button */}
<Button size="md">   {/* Medium button (default) */}
<Button size="lg">   {/* Large button */}
```

### States

```jsx
<Button fullWidth>         {/* 100% width */}
<Button disabled>          {/* Disabled state */}
<Button className="mt-4">  {/* Additional classes */}
```

## 🎯 Button Use Cases

```jsx
// Primary CTA
<Button variant="primary" fullWidth>Get Started</Button>

// Secondary action
<Button variant="secondary">Learn More</Button>

// Icon button
<Button variant="ghost" size="sm">
  <Icon size={16} />
</Button>

// Disabled state
<Button disabled>Processing...</Button>
```

## 📱 Responsive Grid Examples

```jsx
// 1 col on mobile, 2 on tablet, 3 on desktop
<Grid cols={1} md={2} lg={3} gap={6}>

// Stack on mobile, 2 columns desktop
<Grid cols={1} lg={2} gap={4}>

// Full width at all sizes
<Grid cols={1} gap={2}>

// 4 columns on large screens
<Grid cols={1} md={2} lg={4} gap={8}>
```

## 🌙 Dark/Light Theme

```jsx
const [dark, setDark] = useState(true);
const theme = useTheme(dark);

<div className={theme.getColor('shell')}>
  <button className={theme.getComponentClasses('button')}>
    Click
  </button>
</div>

// Toggle theme
<button onClick={() => setDark(!dark)}>
  {dark ? <Sun /> : <Moon />}
</button>
```

## ✨ Text Sizes

```jsx
import { responsiveText } from '@/utils/responsiveUtils';

<h1 className={responsiveText['4xl']}>Huge Title
<h2 className={responsiveText['3xl']}>Big Title
<h3 className={responsiveText['2xl']}>Title
<p className={responsiveText.lg}>Body text
<small className={responsiveText.sm}>Small text
```

## 📏 Spacing Presets

```jsx
import { responsivePadding, responsiveGap } from '@/utils/responsiveUtils';

// Padding sizes
<div className={responsivePadding.xs}>  {/* Extra small */}
<div className={responsivePadding.sm}>  {/* Small */}
<div className={responsivePadding.md}>  {/* Medium */}
<div className={responsivePadding.lg}>  {/* Large */}
<div className={responsivePadding.xl}>  {/* Extra large */}

// Gaps (for Grid/Flex)
<Grid gap={2}>   {/* gap-2 sm:gap-3 md:gap-4 */}
<Grid gap={4}>   {/* gap-4 sm:gap-6 md:gap-8 */}
<Grid gap={6}>   {/* gap-6 sm:gap-8 md:gap-12 */}
```

## 🧪 Testing Responsive Design

**In Browser:**

1. Press `F12` to open DevTools
2. Press `Ctrl+Shift+M` to toggle device mode
3. Test these widths:
   - 375px (iPhone)
   - 768px (iPad)
   - 1024px (Laptop)
   - 1536px (Large screen)

**Key Things to Check:**

- ✅ No horizontal scrolling on mobile
- ✅ Text sizes are readable
- ✅ Buttons are tapable (44px+)
- ✅ Images scale properly
- ✅ Navigation works on mobile
- ✅ Forms are usable on mobile

## 🚨 Common Mistakes

❌ **Using `window.innerWidth` directly**

```jsx
// Don't do this
const width = window.innerWidth;

// Do this instead
const { width } = useResponsive();
```

❌ **Hardcoding responsive classes**

```jsx
// Don't do this
<h1 className="text-2xl sm:text-3xl md:text-4xl">

// Do this instead
<h1 className={responsiveText['2xl']}>
```

❌ **Using fixed width values**

```jsx
// Don't do this
<div style={{ width: '1200px' }}>

// Do this instead
<Container>{content}</Container>
```

❌ **Forgetting mobile-first**

```jsx
// Wrong order
<div className="md:grid-cols-2 grid-cols-3">

// Right order (mobile first)
<div className="grid-cols-1 md:grid-cols-2">
```

## 📚 Documentation to Read

1. **RESPONSIVE_ARCHITECTURE.md** - Complete API reference
2. **REFACTORING_GUIDE.md** - Step-by-step guide
3. **Home.refactored.example.jsx** - Real example
4. **IMPLEMENTATION_STATUS.md** - Progress tracker

## 🆘 Quick Help

**Q: How do I make a button?**

```jsx
import { Button } from "@/components/base";
<Button variant="primary">Click</Button>;
```

**Q: How do I create a responsive grid?**

```jsx
import { Grid } from "@/components/base";
<Grid cols={1} md={2} lg={3} gap={6}>
  {items}
</Grid>;
```

**Q: How do I make responsive text?**

```jsx
import { responsiveText } from "@/utils/responsiveUtils";
<h1 className={responsiveText["3xl"]}>Title</h1>;
```

**Q: How do I check screen size?**

```jsx
import { useResponsive } from "@/hooks/useResponsive";
const { isMobile, isDesktop } = useResponsive();
if (isMobile) {
  /* mobile layout */
}
```

**Q: How do I apply theme?**

```jsx
import { useTheme } from '@/utils/themeManager';
const theme = useTheme(isDark);
<div className={theme.getColor('shell')}>
```

---

## 🎉 You're Ready!

You have everything needed to build responsive, modular pages. Start with one page and follow the refactoring guide. Happy coding! 🚀

**Next Step**: Open [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) to start refactoring your first page.

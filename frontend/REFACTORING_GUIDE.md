# Frontend Refactoring Implementation Guide

## 🎯 Objective

Make all frontend pages **responsive** (mobile-first, all screen sizes) and **modular** (reusable components, separation of concerns) using OOP principles.

## 📦 Components Created

### 1. **Responsive Hooks** (`src/hooks/useResponsive.js`)

- `useResponsive()` - Get breakpoint info (isMobile, isTablet, isDesktop, width)
- `useBreakpoint(size)` - Check if screen matches specific breakpoint
- `useScreenWidth()` - Get current screen width

### 2. **Theme System** (`src/utils/themeManager.js`)

- `ThemeManager` class - Centralized theme management (dark/light)
- Methods: `getTheme()`, `getColor()`, `getComponentClasses()`, `toggle()`

### 3. **Base Components** (`src/components/base/index.js`)

Reusable, responsive components:

- `<Button />` - Variants: primary, secondary, danger, ghost | Sizes: sm, md, lg
- `<Card />` - Container with optional hover effect
- `<Input />` - Form field with error states
- `<Container />` - Responsive max-width wrapper
- `<Section />` - Full-width section with padding
- `<Grid />` - Responsive grid layout
- `<Flex />` - Flexible layout

### 4. **Layout Components** (`src/components/layouts/ResponsiveLayout.jsx`)

- `<ResponsiveNav />` - Mobile-friendly navigation
- `<HeroSection />` - Responsive hero section
- `<ResponsiveGrid />` - Responsive grid with auto-cols
- `<ResponsiveFooter />` - Mobile-responsive footer

### 5. **Utilities** (`src/utils/responsiveUtils.js`)

- `ResponsiveUtils` class - Helper methods for responsive patterns
- `MobileFirst` class - Mobile-first patterns
- Preset objects: `responsivePadding`, `responsiveGap`, `responsiveText`

## 🚀 How to Use

### Step 1: Update Imports

Replace scattered imports with centralized ones:

```jsx
// Before - scattered imports
import styles from "./Home.module.css";
// ... many local styles

// After - use new system
import { useResponsive } from "@/hooks/useResponsive";
import { Button, Card, Input } from "@/components/base";
import { ResponsiveNav } from "@/components/layouts/ResponsiveLayout";
import { responsiveText, responsivePadding } from "@/utils/responsiveUtils";
```

### Step 2: Use Responsive Hooks

```jsx
function MyComponent() {
  // Get responsive info
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Render different layouts
  return (
    <>
      {isMobile && <MobileLayout />}
      {isDesktop && <DesktopLayout />}
    </>
  );
}
```

### Step 3: Replace HTML Elements with Base Components

```jsx
// Before
<button className="px-4 py-2 bg-blue-500 rounded-lg">Click</button>

// After
<Button variant="primary">Click</Button>
```

### Step 4: Use Theme Manager

```jsx
function Page() {
  const [dark, setDark] = useState(true);
  const theme = useTheme(dark);

  return (
    <div className={theme.getColor("shell")}>
      <button className={theme.getComponentClasses("button")}>Click me</button>
    </div>
  );
}
```

### Step 5: Apply Responsive Spacing

```jsx
// Before - hardcoded
<div className="px-4 md:px-8 lg:px-12">Content</div>

// After - use presets
<div className={responsivePadding.lg}>Content</div>
```

## 📋 Refactoring Checklist

For each page/component:

- [ ] Add responsive hooks if needed
- [ ] Replace `<button>` with `<Button />`
- [ ] Replace `<div className="card...">` with `<Card />`
- [ ] Replace form `<input>` with `<Input />`
- [ ] Replace grid layouts with `<Grid />` or `<ResponsiveGrid />`
- [ ] Update spacing with `responsivePadding` presets
- [ ] Update text sizes with `responsiveText` presets
- [ ] Add `useResponsive()` for conditional rendering
- [ ] Test on mobile, tablet, desktop
- [ ] Remove old CSS files (migrate to Tailwind)

## 🔍 Quick Reference: Existing Pages to Update

```
Priority 1 (High Impact):
├── pages/Home.jsx                    → Use HeroSection, ResponsiveNav
├── pages/Dashboard.jsx               → Use ResponsiveGrid for cards
├── pages/LearnPage.jsx               → Use responsive layout
└── pages/ExploreCourses.jsx          → Use Filter + Grid

Priority 2 (Medium Impact):
├── pages/Login.jsx                   → Responsive form
├── pages/Register.jsx                → Responsive form
└── pages/instructor/*.jsx            → All instructor pages

Priority 3 (Low Impact):
├── pages/ViewCertificate.jsx         → Simple page update
└── pages/ForgetPassword.jsx          → Form styling
```

## 🎨 Tailwind Responsive Breakpoints

```
sm: 640px   - Mobile landscape
md: 768px   - Tablet portrait
lg: 1024px  - Tablet landscape / Small desktop
xl: 1280px  - Desktop
2xl: 1536px - Large desktop
```

### Mobile-First Pattern

```jsx
// Always write mobile-first, then add larger breakpoints
<div className="text-sm sm:text-base md:text-lg lg:text-xl">
  Responsive text
</div>
```

## 📊 Before/After Example

### Before (Not Responsive)

```jsx
export default function Home() {
  const [dark, setDark] = useState(true);

  return (
    <div className={dark ? "bg-gray-900" : "bg-white"}>
      <nav className="px-12 py-4 flex justify-between">
        {/* hardcoded nav */}
      </nav>

      <section className="px-12 py-24">
        <h1 className="text-5xl">Title</h1>
        <grid className="grid-cols-3 gap-6">{/* cards */}</grid>
      </section>
    </div>
  );
}
```

### After (Responsive & Modular)

```jsx
export default function Home() {
  const { isMobile } = useResponsive();
  const theme = useTheme(dark);

  return (
    <div className={theme.getColor("shell")}>
      <ResponsiveNav brand="KOMPI" navItems={navItems} rightActions={buttons} />

      <Section>
        <h1 className={responsiveText["3xl"]}>Title</h1>
        <Grid cols={1} md={2} lg={3} gap={6}>
          {items.map((item) => (
            <Card key={item.id}>{item.name}</Card>
          ))}
        </Grid>
      </Section>
    </div>
  );
}
```

## 🧪 Testing Responsive Design

```bash
# Test in browser DevTools
1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Test various device sizes:
   - iPhone 12 (390px)
   - iPad (768px)
   - Desktop (1024px+)
4. Test orientation changes
5. Test zoom levels
```

## 🔗 Component Composition Examples

### Form Page

```jsx
<Container>
  <Section>
    <Flex direction="col" items="center" justify="center">
      <Card className="w-full max-w-md">
        <h2 className={responsiveText.xl}>Login</h2>
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Password" />
        <Button fullWidth variant="primary">
          Login
        </Button>
      </Card>
    </Flex>
  </Section>
</Container>
```

### Dashboard Page

```jsx
<Container>
  <Section>
    <h1 className={responsiveText["2xl"]}>Dashboard</h1>

    <Grid cols={1} md={2} lg={4} gap={6} className="mt-8">
      <Card>
        <h3>Stat 1</h3>
        <p className={responsiveText.lg}>42</p>
      </Card>
      {/* More stat cards */}
    </Grid>

    <Grid cols={1} md={2} gap={6} className="mt-8">
      {courses.map((course) => (
        <Card key={course.id} hoverable>
          {/* Course card */}
        </Card>
      ))}
    </Grid>
  </Section>
</Container>
```

## ⚠️ Common Mistakes to Avoid

1. ❌ **Not testing on mobile** - Always test on actual devices/emulator
2. ❌ **Using inline styles** - Use Tailwind classes instead
3. ❌ **Hardcoding breakpoints** - Use responsive hooks and presets
4. ❌ **Forgetting mobile-first** - Start with mobile, add sm:/md:/lg: classes
5. ❌ **Not using responsive utils** - Use presets instead of reinventing
6. ❌ **Mixing old and new patterns** - Gradually migrate ALL components

## 📖 File Reference

| File                                      | Purpose                     |
| ----------------------------------------- | --------------------------- |
| `hooks/useResponsive.js`                  | Breakpoint detection hooks  |
| `utils/themeManager.js`                   | Dark/light theme management |
| `utils/responsiveUtils.js`                | Helper classes and presets  |
| `components/base/index.js`                | Reusable base components    |
| `components/layouts/ResponsiveLayout.jsx` | Layout components           |
| `RESPONSIVE_ARCHITECTURE.md`              | Architecture documentation  |

## 🎓 Learning Resources

1. Read `RESPONSIVE_ARCHITECTURE.md` for detailed API
2. Check `Home.refactored.example.jsx` for real example
3. Look at JSDoc comments in component files
4. Test each component in browser DevTools

## ✅ Validation Checklist

When done refactoring a page:

- [ ] Responsive on 320px width (iPhone SE)
- [ ] Responsive on 768px width (iPad)
- [ ] Responsive on 1024px width (Laptop)
- [ ] Responsive on 1536px width (Large desktop)
- [ ] No horizontal scrolling on mobile
- [ ] All images scale properly
- [ ] All text is readable on mobile
- [ ] Touch targets are 44px+ on mobile
- [ ] Navigation is usable on mobile
- [ ] Forms are easy to fill on mobile
- [ ] No console errors
- [ ] Theme toggle works correctly
- [ ] Dark/light mode is consistent

---

**Next Steps:**

1. Test the new components in `Home.jsx` or `Dashboard.jsx`
2. Migrate one page at a time
3. Update instructor pages
4. Remove old CSS files as components are migrated

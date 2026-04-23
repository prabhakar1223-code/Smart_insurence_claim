# SmartClaim Design System - Developer Guide

## Overview
This is a comprehensive design system for the SmartClaim Insurance Claim Platform, prepared for developer handoff. All components follow consistent naming conventions, use reusable design tokens, and include all interactive states.

## Quick Navigation
Use the floating navigation menu (top-right) to switch between:
- **Handoff Docs** - Complete developer documentation
- **Components** - All UI components with states
- **Design System** - Color tokens, typography, spacing
- **Landing** - Customer-facing landing page
- **Admin** - Insurance admin dashboard

---

## Design Tokens

### Colors
All colors are defined as CSS custom properties in `/styles/globals.css`:

```css
--primary: #3b82f6          /* Primary blue for CTAs */
--primary-foreground: #ffffff
--secondary: #1e293b         /* Dark secondary */
--accent: #06b6d4           /* Cyan accent */
--destructive: #ef4444       /* Red for errors/delete */
--background: #0a0e1a        /* Dark background */
--foreground: #f8fafc        /* Light text */
--card: #141823              /* Card background */
--border: #1e293b            /* Border color */
--input: #1e293b             /* Input border */
--muted: #1e293b             /* Muted elements */
--muted-foreground: #94a3b8  /* Muted text */
```

**Status Colors:**
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange/Amber)
- Error: `#ef4444` (Red - same as destructive)
- Info: `#3b82f6` (Blue - same as primary)

### Typography Scale
Font sizes are pre-configured in globals.css. **Do NOT use Tailwind text-* utilities** unless changing these:

- **H1**: 36px / 40px line-height (2.25rem / 2.5rem)
- **H2**: 30px / 36px (1.875rem / 2.25rem)
- **H3**: 24px / 32px (1.5rem / 2rem)
- **H4**: 20px / 28px (1.25rem / 1.75rem)
- **Body**: 16px / 24px (1rem / 1.5rem)
- **Caption**: 14px / 20px (0.875rem / 1.25rem) - Use `.text-caption` class
- **Overline**: 12px / 16px (0.75rem / 1rem) - Use `.text-overline` class

### Spacing Scale (Tailwind units)
- 1 = 4px
- 2 = 8px
- 3 = 12px
- 4 = 16px
- 6 = 24px
- 8 = 32px
- 12 = 48px
- 16 = 64px

**Common Spacing Patterns:**
- Section padding: `py-16 lg:py-24` (vertical), `px-4 sm:px-6 lg:px-8` (horizontal)
- Card padding: `p-6 lg:p-8`
- Button padding: `px-6 py-3`
- Input padding: `px-4 py-3`
- Component gaps: `gap-6`, `gap-4`, `gap-3`

### Border Radius
- Small: `4px` (rounded-sm)
- Medium: `8px` (rounded-lg) - **Default for most components**
- Large: `12px` (rounded-xl)
- Full: `9999px` (rounded-full) - For pills/badges

### Shadows
Defined in globals.css:
- `shadow-card`: Standard card elevation
- `shadow-card-hover`: Elevated hover state
- `shadow-card-elevated`: For modals/dialogs

---

## Component Naming Convention

### Layout Components
- `Header` - Site navigation and branding (sticky)
- `Footer` - Site footer with links
- `AdminLayout` - Admin dashboard shell with sidebar
- `Container` - Max-width content wrapper

### Landing Page Components
- `Hero` - Hero section with CTA
- `ProblemSection` - Problem statement
- `HowItWorks` - Step-by-step process
- `Features` - Feature grid
- `Security` - Security/compliance section
- `FAQ` - Accordion FAQ
- `FeatureCard` - Individual feature card
- `StepCard` - Process step card

### Admin Components
- `AdminLogin` - Secure login form
- `AdminDashboard` - Main dashboard with KPIs
- `ClaimsTable` - Data table for claims
- `ClaimReview` - Detailed claim review
- `FraudAlerts` - Fraud alert listing
- `TableRow` - Reusable table row
- `StatusBadge` - Status indicator
- `KPICard` - Key performance indicator card

### Form Components
- `TextInput` - Standard text input
- `TextInputWithIcon` - Input with icon (left/right)
- `SelectDropdown` - Dropdown select
- `Checkbox` - Checkbox input
- `RadioButton` - Radio input
- `Textarea` - Multi-line text
- `FormLabel` - Field label
- `FormError` - Error message

### UI Components
- `Button` - Primary/secondary/destructive
- `IconButton` - Icon-only button
- `Card` - Container card
- `Modal` - Confirmation modal
- `Alert` - Success/error/warning/info
- `Badge` - Status/tag badge
- `ProgressBar` - Progress indicator
- `Timeline` - Event timeline

---

## Interactive States

### Buttons
```html
<!-- Default -->
<button class="bg-primary text-primary-foreground px-6 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]">
  Click Me
</button>

<!-- Hover: opacity-90 -->
<!-- Focus: focus:ring-2 focus:ring-ring -->
<!-- Active: active:scale-[0.98] -->
<!-- Disabled: opacity-50 cursor-not-allowed -->
```

### Inputs
```html
<!-- Default -->
<input class="bg-input-background border border-input px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all" />

<!-- Focus: ring-2 ring-ring -->
<!-- Error: border-destructive focus:ring-destructive -->
<!-- Success: border-[#10b981] focus:ring-[#10b981] -->
<!-- Disabled: opacity-50 cursor-not-allowed -->
```

### Cards
```html
<!-- Default -->
<div class="bg-card border border-border rounded-lg p-6 shadow-card">
  Content
</div>

<!-- Hover: hover:shadow-card-hover -->
<!-- Elevated (modals): shadow-card-elevated -->
```

### Status Badges
```html
<!-- Approved -->
<span class="bg-[#10b981]/20 text-[#10b981] px-3 py-1.5 rounded-full text-sm border border-[#10b981]/20">
  Approved
</span>

<!-- Pending -->
<span class="bg-[#f59e0b]/20 text-[#f59e0b] px-3 py-1.5 rounded-full text-sm border border-[#f59e0b]/20">
  Pending
</span>

<!-- Rejected -->
<span class="bg-destructive/20 text-destructive px-3 py-1.5 rounded-full text-sm border border-destructive/20">
  Rejected
</span>
```

---

## Responsive Breakpoints

### Breakpoints
- `sm`: 640px (landscape phones)
- `md`: 768px (tablets)
- `lg`: 1024px (desktops)
- `xl`: 1280px (large desktops)

### Common Patterns

**Grid Layouts:**
```html
<!-- 1 col → 2 cols → 3 cols -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- 1 col → 2 cols → 4 cols (KPI cards) -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- 1 col → 3 cols (2/3 - 1/3 split) -->
<div class="grid lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2">Main content</div>
  <div>Sidebar</div>
</div>
```

**Flex Layouts:**
```html
<!-- Stack → Horizontal -->
<div class="flex flex-col lg:flex-row gap-6">

<!-- Stack → Horizontal with space-between -->
<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
```

**Visibility:**
```html
<!-- Hide on mobile, show on desktop -->
<div class="hidden lg:block">Desktop content</div>

<!-- Show on mobile, hide on desktop -->
<div class="lg:hidden">Mobile menu</div>
```

**Typography Scaling:**
```html
<!-- Hero heading -->
<h1 class="text-4xl sm:text-5xl lg:text-6xl">
  Responsive Heading
</h1>
```

---

## Accessibility

### Focus States
All interactive elements MUST have visible focus states:
```css
focus:outline-none focus:ring-2 focus:ring-ring
```

### Color Contrast
- Text: Minimum 4.5:1 ratio (WCAG AA)
- UI components: Minimum 3:1 ratio
- All color combinations in this design system meet WCAG AA standards

### Screen Reader Support
Icon buttons should include aria-label or sr-only text:
```html
<button aria-label="Close modal">
  <X size={20} />
</button>

<!-- Or with sr-only -->
<button>
  <Trash size={20} />
  <span class="sr-only">Delete item</span>
</button>
```

---

## Libraries Used

### Icons
```javascript
import { Check, X, AlertCircle } from 'lucide-react';
```

### Charts (Admin Dashboard)
```javascript
import { AreaChart, BarChart, PieChart } from 'recharts';
```

### Animations (Optional)
```javascript
import { motion } from 'motion/react';
```

---

## File Structure

```
/
├── App.tsx                          # Main app with view switcher
├── styles/
│   └── globals.css                  # Design tokens & global styles
├── components/
│   ├── landing/                     # Landing page components
│   │   ├── Header.tsx               # Site header (sticky nav)
│   │   ├── Hero.tsx                 # Hero section with CTA
│   │   ├── ProblemSection.tsx       # Problem statement
│   │   ├── HowItWorks.tsx           # Process steps
│   │   ├── Features.tsx             # Feature grid
│   │   ├── Security.tsx             # Security section
│   │   ├── FAQ.tsx                  # FAQ accordion
│   │   └── Footer.tsx               # Site footer
│   ├── admin/                       # Admin dashboard components
│   │   ├── AdminLogin.tsx           # Secure login
│   │   ├── AdminLayout.tsx          # Dashboard shell
│   │   ├── AdminDashboard.tsx       # Main dashboard
│   │   ├── ClaimsTable.tsx          # Claims data table
│   │   ├── ClaimReview.tsx          # Claim detail view
│   │   └── FraudAlerts.tsx          # Fraud alerts
│   ├── design-system/               # Design documentation
│   │   ├── ComponentShowcase.tsx    # All UI components
│   │   └── DeveloperHandoff.tsx     # This documentation
│   ├── LandingPage.tsx              # Landing page assembly
│   ├── AdminApp.tsx                 # Admin app assembly
│   └── DesignSystemShowcase.tsx     # Design tokens display
└── DEVELOPER_GUIDE.md               # This file
```

---

## Implementation Checklist

### Before Starting
- [ ] Review design tokens in `/styles/globals.css`
- [ ] Understand responsive breakpoints (sm, md, lg, xl)
- [ ] Familiarize with component naming convention
- [ ] Review interactive state patterns

### During Development
- [ ] Use semantic HTML (h1, h2, p, etc.) for typography
- [ ] Apply consistent spacing from spacing scale
- [ ] Include all interactive states (default, hover, focus, active, disabled)
- [ ] Test responsive behavior at all breakpoints
- [ ] Ensure color contrast meets WCAG AA
- [ ] Add focus states to all interactive elements
- [ ] Include aria-labels for icon buttons

### Before Handoff
- [ ] Test keyboard navigation
- [ ] Verify mobile responsiveness
- [ ] Check all forms validate properly
- [ ] Confirm all modals have escape/cancel options
- [ ] Test with screen reader (basic check)

---

## Common Patterns

### Modal Pattern
```jsx
{showModal && (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-card-elevated">
      <h3>Modal Title</h3>
      <p className="text-muted-foreground mt-2">Modal content</p>
      <div className="flex gap-3 mt-6">
        <button onClick={() => setShowModal(false)}>Cancel</button>
        <button className="bg-primary text-primary-foreground">Confirm</button>
      </div>
    </div>
  </div>
)}
```

### Data Table Pattern
```jsx
<div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
  <table className="w-full">
    <thead className="bg-muted/50 border-b border-border">
      <tr>
        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
          Column
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr className="hover:bg-muted/30 transition-colors">
        <td className="px-6 py-4">Cell</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Status Badge Pattern
```jsx
<span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${
  status === 'approved' 
    ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/20' 
    : status === 'pending'
    ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/20'
    : 'bg-destructive/20 text-destructive border-destructive/20'
}`}>
  {status}
</span>
```

---

## Support & Questions

For questions about implementation:
1. Check the **Component Showcase** for visual examples
2. Review **Design System** page for token reference
3. Inspect **Handoff Docs** for detailed specifications
4. Examine component source code in `/components`

All components are fully implemented and production-ready. Simply copy the patterns and adapt as needed.

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Framework:** React + Tailwind CSS v4.0  
**Theme:** Dark Mode (Default)

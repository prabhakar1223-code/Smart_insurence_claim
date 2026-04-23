import React from 'react';
import { FileText, Code, Palette, Layout, Smartphone } from 'lucide-react';

export function DeveloperHandoff() {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-4">Developer Handoff Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Complete component library with naming conventions, spacing, and interaction patterns
          </p>
        </div>

        {/* Component Naming Convention */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
              <FileText className="text-primary" size={24} />
            </div>
            <h2>Component Naming Convention</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-4">Layout Components</h3>
              <div className="bg-muted/30 border border-border rounded-lg p-4 font-mono text-sm">
                <div className="space-y-2">
                  <p>Header - Site navigation and branding</p>
                  <p>Footer - Site footer with links and contact</p>
                  <p>AdminLayout - Admin dashboard shell with sidebar</p>
                  <p>AdminSidebar - Navigation sidebar for admin panel</p>
                  <p>Container - Max-width content wrapper</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Landing Page Components</h3>
              <div className="bg-muted/30 border border-border rounded-lg p-4 font-mono text-sm">
                <div className="space-y-2">
                  <p>Hero - Main hero section with CTA</p>
                  <p>ProblemSection - Problem statement section</p>
                  <p>HowItWorks - Step-by-step process section</p>
                  <p>Features - Feature grid section</p>
                  <p>Security - Security and compliance section</p>
                  <p>FAQ - Accordion FAQ section</p>
                  <p>FeatureCard - Individual feature card component</p>
                  <p>StepCard - Process step card component</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Admin Components</h3>
              <div className="bg-muted/30 border border-border rounded-lg p-4 font-mono text-sm">
                <div className="space-y-2">
                  <p>AdminLogin - Secure admin login form</p>
                  <p>AdminDashboard - Main dashboard with KPIs and charts</p>
                  <p>ClaimsTable - Data table for claims management</p>
                  <p>ClaimReview - Detailed claim review interface</p>
                  <p>FraudAlerts - Fraud detection alert listing</p>
                  <p>TableRow - Reusable table row component</p>
                  <p>StatusBadge - Status indicator badge</p>
                  <p>KPICard - Key performance indicator card</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Form Components</h3>
              <div className="bg-muted/30 border border-border rounded-lg p-4 font-mono text-sm">
                <div className="space-y-2">
                  <p>TextInput - Standard text input field</p>
                  <p>TextInputWithIcon - Input with left/right icon</p>
                  <p>SelectDropdown - Dropdown select field</p>
                  <p>Checkbox - Checkbox input</p>
                  <p>RadioButton - Radio button input</p>
                  <p>Textarea - Multi-line text input</p>
                  <p>FormLabel - Form field label</p>
                  <p>FormError - Error message component</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">UI Components</h3>
              <div className="bg-muted/30 border border-border rounded-lg p-4 font-mono text-sm">
                <div className="space-y-2">
                  <p>Button - Primary, secondary, destructive variants</p>
                  <p>IconButton - Icon-only button</p>
                  <p>Card - Container card component</p>
                  <p>Modal - Confirmation/dialog modal</p>
                  <p>Alert - Success, error, warning, info alerts</p>
                  <p>Badge - Status and tag badges</p>
                  <p>ProgressBar - Loading/progress indicator</p>
                  <p>Timeline - Event timeline component</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interaction States */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-accent/10 border border-accent/20 p-3 rounded-lg">
              <Code className="text-accent" size={24} />
            </div>
            <h2>Interactive States</h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="mb-4">Button States</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3">State</th>
                      <th className="text-left px-4 py-3">CSS Classes</th>
                      <th className="text-left px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 font-medium">Default</td>
                      <td className="px-4 py-3 font-mono text-sm">bg-primary text-primary-foreground</td>
                      <td className="px-4 py-3 text-muted-foreground">Base button state</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Hover</td>
                      <td className="px-4 py-3 font-mono text-sm">hover:opacity-90</td>
                      <td className="px-4 py-3 text-muted-foreground">Mouse over state</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Focus</td>
                      <td className="px-4 py-3 font-mono text-sm">focus:ring-2 focus:ring-ring</td>
                      <td className="px-4 py-3 text-muted-foreground">Keyboard navigation</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Active</td>
                      <td className="px-4 py-3 font-mono text-sm">active:scale-[0.98]</td>
                      <td className="px-4 py-3 text-muted-foreground">Click/tap feedback</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Disabled</td>
                      <td className="px-4 py-3 font-mono text-sm">opacity-50 cursor-not-allowed</td>
                      <td className="px-4 py-3 text-muted-foreground">Non-interactive state</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Input States</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3">State</th>
                      <th className="text-left px-4 py-3">CSS Classes</th>
                      <th className="text-left px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 font-medium">Default</td>
                      <td className="px-4 py-3 font-mono text-sm">border border-input</td>
                      <td className="px-4 py-3 text-muted-foreground">Unfocused input</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Focus</td>
                      <td className="px-4 py-3 font-mono text-sm">focus:ring-2 focus:ring-ring</td>
                      <td className="px-4 py-3 text-muted-foreground">Active input field</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Error</td>
                      <td className="px-4 py-3 font-mono text-sm">border-destructive focus:ring-destructive</td>
                      <td className="px-4 py-3 text-muted-foreground">Validation error</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Success</td>
                      <td className="px-4 py-3 font-mono text-sm">border-[#10b981] focus:ring-[#10b981]</td>
                      <td className="px-4 py-3 text-muted-foreground">Valid input</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Disabled</td>
                      <td className="px-4 py-3 font-mono text-sm">opacity-50 cursor-not-allowed</td>
                      <td className="px-4 py-3 text-muted-foreground">Non-editable field</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Card States</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3">State</th>
                      <th className="text-left px-4 py-3">CSS Classes</th>
                      <th className="text-left px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 font-medium">Default</td>
                      <td className="px-4 py-3 font-mono text-sm">shadow-card</td>
                      <td className="px-4 py-3 text-muted-foreground">Standard card elevation</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Hover</td>
                      <td className="px-4 py-3 font-mono text-sm">hover:shadow-card-hover</td>
                      <td className="px-4 py-3 text-muted-foreground">Elevated on hover</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Elevated</td>
                      <td className="px-4 py-3 font-mono text-sm">shadow-card-elevated</td>
                      <td className="px-4 py-3 text-muted-foreground">For modals/overlays</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing System */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#10b981]/10 border border-[#10b981]/20 p-3 rounded-lg">
              <Layout className="text-[#10b981]" size={24} />
            </div>
            <h2>Spacing & Layout System</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-4">Container Max-Widths</h3>
              <div className="space-y-3">
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">max-w-7xl</span>
                  <span className="text-muted-foreground">1280px - Main content container</span>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">max-w-4xl</span>
                  <span className="text-muted-foreground">896px - Article/form content</span>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">max-w-md</span>
                  <span className="text-muted-foreground">448px - Modals/narrow content</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Section Spacing</h3>
              <div className="space-y-3">
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">py-16 lg:py-24</span>
                  <span className="text-muted-foreground">Section vertical padding (mobile/desktop)</span>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">px-4 sm:px-6 lg:px-8</span>
                  <span className="text-muted-foreground">Section horizontal padding (responsive)</span>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">space-y-6</span>
                  <span className="text-muted-foreground">Component vertical spacing</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Component Padding</h3>
              <div className="space-y-3">
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">p-6 lg:p-8</span>
                  <span className="text-muted-foreground">Card/modal padding</span>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">px-6 py-3</span>
                  <span className="text-muted-foreground">Button padding (horizontal/vertical)</span>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">px-4 py-3</span>
                  <span className="text-muted-foreground">Input field padding</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Gap Spacing</h3>
              <div className="space-y-3">
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">gap-12 lg:gap-16</span>
                  <span className="text-muted-foreground">Large section gaps</span>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">gap-6</span>
                  <span className="text-muted-foreground">Grid/flex column gaps</span>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">gap-4</span>
                  <span className="text-muted-foreground">Form field gaps</span>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex justify-between items-center">
                  <span className="font-mono">gap-2 lg:gap-3</span>
                  <span className="text-muted-foreground">Icon and text gaps</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Design */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 p-3 rounded-lg">
              <Smartphone className="text-[#f59e0b]" size={24} />
            </div>
            <h2>Responsive Design Patterns</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-4">Grid Patterns</h3>
              <div className="space-y-4">
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="font-mono mb-2">grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6</p>
                  <p className="text-caption text-muted-foreground">
                    Mobile: 1 column → Tablet: 2 columns → Desktop: 3 columns
                  </p>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="font-mono mb-2">grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4</p>
                  <p className="text-caption text-muted-foreground">
                    Mobile: 1 column → Small: 2 columns → Large: 4 columns (for KPI cards)
                  </p>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="font-mono mb-2">grid lg:grid-cols-3 gap-6</p>
                  <p className="text-caption text-muted-foreground">
                    Mobile: Stacked → Desktop: 3-column layout
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Flex Patterns</h3>
              <div className="space-y-4">
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="font-mono mb-2">flex flex-col lg:flex-row gap-6</p>
                  <p className="text-caption text-muted-foreground">
                    Mobile: Vertical stack → Desktop: Horizontal layout
                  </p>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="font-mono mb-2">flex flex-col sm:flex-row items-center justify-between gap-4</p>
                  <p className="text-caption text-muted-foreground">
                    Mobile: Vertical → Small+: Horizontal with space-between
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Visibility Patterns</h3>
              <div className="space-y-4">
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="font-mono mb-2">hidden lg:block</p>
                  <p className="text-caption text-muted-foreground">
                    Hide on mobile, show on desktop (e.g., detailed info)
                  </p>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="font-mono mb-2">lg:hidden</p>
                  <p className="text-caption text-muted-foreground">
                    Show on mobile, hide on desktop (e.g., hamburger menu)
                  </p>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="font-mono mb-2">hidden md:flex</p>
                  <p className="text-caption text-muted-foreground">
                    Hide on mobile, show as flex on tablet+
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Typography Responsive</h3>
              <div className="space-y-4">
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="font-mono mb-2">text-4xl sm:text-5xl lg:text-6xl</p>
                  <p className="text-caption text-muted-foreground">
                    Hero headline - scales from 36px to 60px
                  </p>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="font-mono mb-2">text-lg</p>
                  <p className="text-caption text-muted-foreground">
                    Body text - usually constant across breakpoints
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation Notes */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 p-3 rounded-lg">
              <Palette className="text-[#8b5cf6]" size={24} />
            </div>
            <h2>Implementation Notes</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg p-6">
              <h4 className="mb-3 text-[#10b981]">CSS Framework</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#10b981] mt-1">•</span>
                  <span>Using Tailwind CSS v4.0 with custom design tokens in /styles/globals.css</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10b981] mt-1">•</span>
                  <span>All color variables are defined as CSS custom properties (--primary, --background, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10b981] mt-1">•</span>
                  <span>Dark mode is the default theme - set via .dark class on root element</span>
                </li>
              </ul>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h4 className="mb-3 text-primary">Typography</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Font sizes and line heights are pre-configured in globals.css - avoid using text-* utility classes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Use semantic HTML (h1, h2, h3, p) - styling is automatically applied</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>For special sizes, use .text-caption or .text-overline helper classes</span>
                </li>
              </ul>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
              <h4 className="mb-3 text-accent">Accessibility</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>All interactive elements have focus states (focus:ring-2 focus:ring-ring)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Color contrast ratios meet WCAG AA standards (4.5:1 for text, 3:1 for UI)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Icon buttons should include aria-label or sr-only text for screen readers</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg p-6">
              <h4 className="mb-3 text-[#f59e0b]">Component Libraries</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#f59e0b] mt-1">•</span>
                  <span>Icons: lucide-react (import from 'lucide-react')</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#f59e0b] mt-1">•</span>
                  <span>Charts: recharts (for dashboard analytics)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#f59e0b] mt-1">•</span>
                  <span>Animations: motion/react (import from 'motion/react')</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* File Structure */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <h2 className="mb-6">Project File Structure</h2>
          
          <div className="bg-muted/30 border border-border rounded-lg p-6 font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{`/
├── App.tsx                          # Main application entry
├── styles/
│   └── globals.css                  # Design tokens and global styles
├── components/
│   ├── landing/                     # Landing page components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── ProblemSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Features.tsx
│   │   ├── Security.tsx
│   │   ├── FAQ.tsx
│   │   └── Footer.tsx
│   ├── admin/                       # Admin dashboard components
│   │   ├── AdminLogin.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── ClaimsTable.tsx
│   │   ├── ClaimReview.tsx
│   │   └── FraudAlerts.tsx
│   ├── design-system/               # Design system documentation
│   │   ├── ComponentShowcase.tsx
│   │   └── DeveloperHandoff.tsx
│   ├── LandingPage.tsx              # Landing page assembly
│   ├── AdminApp.tsx                 # Admin app assembly
│   └── DesignSystemShowcase.tsx     # Full design system display
`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}

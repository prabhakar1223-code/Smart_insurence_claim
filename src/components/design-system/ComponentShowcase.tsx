import React, { useState } from 'react';
import { 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  Loader,
  Search,
  Mail,
  Lock,
  Eye,
  FileText,
  Download
} from 'lucide-react';

export function ComponentShowcase() {
  const [inputValue, setInputValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');

  return (
    <div className="min-h-screen bg-background p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-4">SmartClaim Design System</h1>
          <p className="text-lg text-muted-foreground">
            Component Library for Developer Handoff
          </p>
          <p className="text-caption text-muted-foreground mt-2">
            All components follow consistent naming, spacing, and interaction patterns
          </p>
        </div>

        {/* Design Tokens Section */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <h2 className="mb-6">Design Tokens Reference</h2>
          
          {/* Colors */}
          <div className="mb-8">
            <h3 className="mb-4">Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 bg-primary rounded-lg border border-border"></div>
                <p className="font-mono text-sm">--primary</p>
                <p className="text-caption text-muted-foreground">#3b82f6</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-primary-foreground rounded-lg border border-border"></div>
                <p className="font-mono text-sm">--primary-foreground</p>
                <p className="text-caption text-muted-foreground">#ffffff</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-secondary rounded-lg border border-border"></div>
                <p className="font-mono text-sm">--secondary</p>
                <p className="text-caption text-muted-foreground">#1e293b</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-accent rounded-lg border border-border"></div>
                <p className="font-mono text-sm">--accent</p>
                <p className="text-caption text-muted-foreground">#06b6d4</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-destructive rounded-lg border border-border"></div>
                <p className="font-mono text-sm">--destructive</p>
                <p className="text-caption text-muted-foreground">#ef4444</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-[#10b981] rounded-lg border border-border"></div>
                <p className="font-mono text-sm">Success Green</p>
                <p className="text-caption text-muted-foreground">#10b981</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-[#f59e0b] rounded-lg border border-border"></div>
                <p className="font-mono text-sm">Warning Orange</p>
                <p className="text-caption text-muted-foreground">#f59e0b</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-muted rounded-lg border border-border"></div>
                <p className="font-mono text-sm">--muted</p>
                <p className="text-caption text-muted-foreground">#1e293b</p>
              </div>
            </div>
          </div>

          {/* Spacing */}
          <div className="mb-8">
            <h3 className="mb-4">Spacing Scale</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-mono">4px (1)</div>
                <div className="h-4 bg-primary rounded" style={{ width: '4px' }}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-mono">8px (2)</div>
                <div className="h-4 bg-primary rounded" style={{ width: '8px' }}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-mono">12px (3)</div>
                <div className="h-4 bg-primary rounded" style={{ width: '12px' }}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-mono">16px (4)</div>
                <div className="h-4 bg-primary rounded" style={{ width: '16px' }}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-mono">24px (6)</div>
                <div className="h-4 bg-primary rounded" style={{ width: '24px' }}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-mono">32px (8)</div>
                <div className="h-4 bg-primary rounded" style={{ width: '32px' }}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-mono">48px (12)</div>
                <div className="h-4 bg-primary rounded" style={{ width: '48px' }}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-mono">64px (16)</div>
                <div className="h-4 bg-primary rounded" style={{ width: '64px' }}></div>
              </div>
            </div>
          </div>

          {/* Border Radius */}
          <div className="mb-8">
            <h3 className="mb-4">Border Radius</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className="h-16 bg-card border-2 border-border" style={{ borderRadius: '4px' }}></div>
                <p className="text-sm font-mono">4px (sm)</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-16 bg-card border-2 border-border" style={{ borderRadius: '8px' }}></div>
                <p className="text-sm font-mono">8px (md)</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-16 bg-card border-2 border-border" style={{ borderRadius: '12px' }}></div>
                <p className="text-sm font-mono">12px (lg)</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-16 bg-card border-2 border-border" style={{ borderRadius: '9999px' }}></div>
                <p className="text-sm font-mono">9999px (full)</p>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div>
            <h3 className="mb-4">Typography Scale</h3>
            <div className="space-y-4">
              <div>
                <h1>Heading 1 - 36px/40px (2.25rem/2.5rem)</h1>
                <p className="text-caption text-muted-foreground font-mono">font-size: 2.25rem; line-height: 2.5rem;</p>
              </div>
              <div>
                <h2>Heading 2 - 30px/36px (1.875rem/2.25rem)</h2>
                <p className="text-caption text-muted-foreground font-mono">font-size: 1.875rem; line-height: 2.25rem;</p>
              </div>
              <div>
                <h3>Heading 3 - 24px/32px (1.5rem/2rem)</h3>
                <p className="text-caption text-muted-foreground font-mono">font-size: 1.5rem; line-height: 2rem;</p>
              </div>
              <div>
                <h4>Heading 4 - 20px/28px (1.25rem/1.75rem)</h4>
                <p className="text-caption text-muted-foreground font-mono">font-size: 1.25rem; line-height: 1.75rem;</p>
              </div>
              <div>
                <p>Body - 16px/24px (1rem/1.5rem)</p>
                <p className="text-caption text-muted-foreground font-mono">font-size: 1rem; line-height: 1.5rem;</p>
              </div>
              <div>
                <p className="text-caption">Caption - 14px/20px (0.875rem/1.25rem)</p>
                <p className="text-caption text-muted-foreground font-mono">font-size: 0.875rem; line-height: 1.25rem;</p>
              </div>
              <div>
                <p className="text-overline">OVERLINE - 12px/16px (0.75rem/1rem)</p>
                <p className="text-caption text-muted-foreground font-mono">font-size: 0.75rem; line-height: 1rem; text-transform: uppercase;</p>
              </div>
            </div>
          </div>
        </section>

        {/* Button Components */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <h2 className="mb-6">Buttons - All Variants & States</h2>
          
          <div className="space-y-8">
            {/* Primary Buttons */}
            <div>
              <h3 className="mb-4">Primary Button</h3>
              <div className="flex flex-wrap gap-4">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]">
                  Default
                </button>
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg opacity-90">
                  Hover State
                </button>
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg ring-2 ring-ring ring-offset-2 ring-offset-background">
                  Focus State
                </button>
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg opacity-50 cursor-not-allowed" disabled>
                  Disabled
                </button>
              </div>
              <p className="text-caption text-muted-foreground mt-3 font-mono">
                Class: bg-primary text-primary-foreground px-6 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]
              </p>
            </div>

            {/* Secondary Buttons */}
            <div>
              <h3 className="mb-4">Secondary Button</h3>
              <div className="flex flex-wrap gap-4">
                <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg transition-all hover:bg-accent hover:text-accent-foreground border border-border active:scale-[0.98]">
                  Default
                </button>
                <button className="bg-accent text-accent-foreground px-6 py-3 rounded-lg border border-border">
                  Hover State
                </button>
                <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg border border-border ring-2 ring-ring ring-offset-2 ring-offset-background">
                  Focus State
                </button>
                <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg border border-border opacity-50 cursor-not-allowed" disabled>
                  Disabled
                </button>
              </div>
              <p className="text-caption text-muted-foreground mt-3 font-mono">
                Class: bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-accent border border-border
              </p>
            </div>

            {/* Destructive Buttons */}
            <div>
              <h3 className="mb-4">Destructive Button</h3>
              <div className="flex flex-wrap gap-4">
                <button className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]">
                  Default
                </button>
                <button className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg opacity-90">
                  Hover State
                </button>
                <button className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg ring-2 ring-ring ring-offset-2 ring-offset-background">
                  Focus State
                </button>
                <button className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg opacity-50 cursor-not-allowed" disabled>
                  Disabled
                </button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div>
              <h3 className="mb-4">Icon Button</h3>
              <div className="flex flex-wrap gap-4">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <FileText size={20} />
                </button>
                <button className="p-2 bg-muted rounded-lg">
                  <Download size={20} />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg ring-2 ring-ring">
                  <Eye size={20} />
                </button>
                <button className="p-2 rounded-lg opacity-50 cursor-not-allowed" disabled>
                  <X size={20} />
                </button>
              </div>
              <p className="text-caption text-muted-foreground mt-3 font-mono">
                Class: p-2 hover:bg-muted rounded-lg transition-colors
              </p>
            </div>
          </div>
        </section>

        {/* Form Components */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <h2 className="mb-6">Form Components - All States</h2>
          
          <div className="space-y-8">
            {/* Text Input */}
            <div>
              <h3 className="mb-4">Text Input</h3>
              <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
                <div className="space-y-2">
                  <label>Default State</label>
                  <input
                    type="text"
                    placeholder="Enter text..."
                    className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label>With Value</label>
                  <input
                    type="text"
                    value="Sample text"
                    onChange={() => {}}
                    className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label>Focus State</label>
                  <input
                    type="text"
                    placeholder="Focused..."
                    className="w-full bg-input-background border border-input px-4 py-3 rounded-lg ring-2 ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label>Disabled State</label>
                  <input
                    type="text"
                    placeholder="Disabled..."
                    disabled
                    className="w-full bg-input-background border border-input px-4 py-3 rounded-lg opacity-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label>Error State</label>
                  <input
                    type="text"
                    placeholder="Invalid input"
                    className="w-full bg-input-background border-2 border-destructive px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive transition-all"
                  />
                  <p className="text-caption text-destructive flex items-center gap-1">
                    <AlertCircle size={14} />
                    This field is required
                  </p>
                </div>
                <div className="space-y-2">
                  <label>Success State</label>
                  <input
                    type="text"
                    value="Valid input"
                    onChange={() => {}}
                    className="w-full bg-input-background border-2 border-[#10b981] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] transition-all"
                  />
                  <p className="text-caption text-[#10b981] flex items-center gap-1">
                    <Check size={14} />
                    Looks good!
                  </p>
                </div>
              </div>
              <p className="text-caption text-muted-foreground mt-4 font-mono">
                Class: bg-input-background border border-input px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring
              </p>
            </div>

            {/* Input with Icon */}
            <div>
              <h3 className="mb-4">Input with Icon</h3>
              <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
                <div className="space-y-2">
                  <label>Left Icon</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full bg-input-background border border-input pl-11 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label>Right Icon (Toggle)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full bg-input-background border border-input pl-11 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <Eye size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <div>
              <h3 className="mb-4">Checkbox</h3>
              <div className="space-y-3 max-w-md">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-input bg-input-background accent-primary cursor-pointer"
                  />
                  <span>Unchecked (Default)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked
                    onChange={() => {}}
                    className="w-5 h-5 rounded border-input bg-input-background accent-primary cursor-pointer"
                  />
                  <span>Checked</span>
                </label>
                <label className="flex items-center gap-3 opacity-50 cursor-not-allowed">
                  <input
                    type="checkbox"
                    disabled
                    className="w-5 h-5 rounded border-input bg-input-background accent-primary"
                  />
                  <span>Disabled</span>
                </label>
              </div>
            </div>

            {/* Select Dropdown */}
            <div>
              <h3 className="mb-4">Select Dropdown</h3>
              <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
                <div className="space-y-2">
                  <label>Default Select</label>
                  <select className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all">
                    <option>Select an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label>Disabled Select</label>
                  <select 
                    disabled
                    className="w-full bg-input-background border border-input px-4 py-3 rounded-lg opacity-50 cursor-not-allowed"
                  >
                    <option>Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <h3 className="mb-4">Textarea</h3>
              <div className="max-w-3xl space-y-2">
                <label>Message</label>
                <textarea
                  placeholder="Enter your message..."
                  rows={4}
                  className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </section>

        {/* Status Components */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <h2 className="mb-6">Status Badges & Tags</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="mb-4">Status Badges</h3>
              <div className="flex flex-wrap gap-3">
                <span className="bg-[#10b981]/20 text-[#10b981] px-3 py-1.5 rounded-full text-sm border border-[#10b981]/20 flex items-center gap-1.5">
                  <Check size={14} />
                  Approved
                </span>
                <span className="bg-[#f59e0b]/20 text-[#f59e0b] px-3 py-1.5 rounded-full text-sm border border-[#f59e0b]/20 flex items-center gap-1.5">
                  <Loader size={14} />
                  Pending
                </span>
                <span className="bg-destructive/20 text-destructive px-3 py-1.5 rounded-full text-sm border border-destructive/20 flex items-center gap-1.5">
                  <X size={14} />
                  Rejected
                </span>
                <span className="bg-accent/20 text-accent px-3 py-1.5 rounded-full text-sm border border-accent/20 flex items-center gap-1.5">
                  <Eye size={14} />
                  In Review
                </span>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Priority Tags</h3>
              <div className="flex flex-wrap gap-3">
                <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-medium">
                  High Priority
                </span>
                <span className="bg-[#f59e0b]/10 text-[#f59e0b] px-3 py-1 rounded-full text-xs font-medium">
                  Medium Priority
                </span>
                <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">
                  Low Priority
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Card Components */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <h2 className="mb-6">Card Components</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Card */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <h3 className="mb-2">Basic Card</h3>
              <p className="text-muted-foreground">Standard card with border and shadow</p>
              <p className="text-caption text-muted-foreground mt-4 font-mono">shadow-card</p>
            </div>

            {/* Card with Hover */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all cursor-pointer">
              <h3 className="mb-2">Hover Card</h3>
              <p className="text-muted-foreground">Card with hover elevation effect</p>
              <p className="text-caption text-muted-foreground mt-4 font-mono">hover:shadow-card-hover</p>
            </div>

            {/* Elevated Card */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card-elevated">
              <h3 className="mb-2">Elevated Card</h3>
              <p className="text-muted-foreground">Card with elevated shadow for modals</p>
              <p className="text-caption text-muted-foreground mt-4 font-mono">shadow-card-elevated</p>
            </div>
          </div>
        </section>

        {/* Alert Components */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <h2 className="mb-6">Alert Components</h2>
          
          <div className="space-y-4 max-w-3xl">
            <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg p-4 flex items-start gap-3">
              <Check className="text-[#10b981] flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-[#10b981]">Success</p>
                <p className="text-sm text-muted-foreground">Your changes have been saved successfully.</p>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
              <Info className="text-primary flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-primary">Information</p>
                <p className="text-sm text-muted-foreground">Please review the terms before proceeding.</p>
              </div>
            </div>

            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-[#f59e0b] flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-[#f59e0b]">Warning</p>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-destructive">Error</p>
                <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Breakpoints */}
        <section className="bg-card border border-border rounded-lg p-8 shadow-card">
          <h2 className="mb-6">Responsive Breakpoints</h2>
          
          <div className="space-y-4">
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <p className="font-mono mb-2">sm: 640px</p>
              <p className="text-caption text-muted-foreground">Small devices (landscape phones)</p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <p className="font-mono mb-2">md: 768px</p>
              <p className="text-caption text-muted-foreground">Medium devices (tablets)</p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <p className="font-mono mb-2">lg: 1024px</p>
              <p className="text-caption text-muted-foreground">Large devices (desktops)</p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <p className="font-mono mb-2">xl: 1280px</p>
              <p className="text-caption text-muted-foreground">Extra large devices (large desktops)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

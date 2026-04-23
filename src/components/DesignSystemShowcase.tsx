import React from 'react';
import { Check, X, AlertCircle, Clock, Upload, Search, FileText, Shield } from 'lucide-react';

export function DesignSystemShowcase() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="space-y-2">
          <h1>Smart Insurance Claim Platform</h1>
          <p className="text-muted-foreground">
            Design System Documentation - Dark Theme, Mobile-First, WCAG AA Compliant
          </p>
        </header>

        {/* Color Palette */}
        <section className="space-y-6">
          <div>
            <h2>Color Palette</h2>
            <p className="text-muted-foreground mt-1">
              High contrast colors optimized for accessibility and insurance workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Primary */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <div className="space-y-3">
                <div className="h-20 bg-primary rounded-md shadow-card-hover"></div>
                <div>
                  <h4>Primary</h4>
                  <p className="text-caption text-muted-foreground">#3b82f6</p>
                  <small className="text-muted-foreground">Key actions, CTAs, links</small>
                </div>
              </div>
            </div>

            {/* Secondary */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <div className="space-y-3">
                <div className="h-20 bg-secondary rounded-md shadow-card-hover"></div>
                <div>
                  <h4>Secondary</h4>
                  <p className="text-caption text-muted-foreground">#1e293b</p>
                  <small className="text-muted-foreground">Secondary actions, cards</small>
                </div>
              </div>
            </div>

            {/* Accent */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <div className="space-y-3">
                <div className="h-20 bg-accent rounded-md shadow-card-hover"></div>
                <div>
                  <h4>Accent</h4>
                  <p className="text-caption text-muted-foreground">#0ea5e9</p>
                  <small className="text-muted-foreground">Highlights, hover states</small>
                </div>
              </div>
            </div>

            {/* Success */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <div className="space-y-3">
                <div className="h-20 bg-[#10b981] rounded-md shadow-card-hover"></div>
                <div>
                  <h4>Success</h4>
                  <p className="text-caption text-muted-foreground">#10b981</p>
                  <small className="text-muted-foreground">Approved claims, success states</small>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <div className="space-y-3">
                <div className="h-20 bg-[#f59e0b] rounded-md shadow-card-hover"></div>
                <div>
                  <h4>Warning</h4>
                  <p className="text-caption text-muted-foreground">#f59e0b</p>
                  <small className="text-muted-foreground">Pending, needs attention</small>
                </div>
              </div>
            </div>

            {/* Error */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <div className="space-y-3">
                <div className="h-20 bg-destructive rounded-md shadow-card-hover"></div>
                <div>
                  <h4>Error</h4>
                  <p className="text-caption text-muted-foreground">#ef4444</p>
                  <small className="text-muted-foreground">Rejected, critical errors</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Scale */}
        <section className="space-y-6">
          <div>
            <h2>Typography Scale</h2>
            <p className="text-muted-foreground mt-1">
              Optimized for readability on mobile and desktop screens
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-6">
            <div>
              <h1>Heading 1 - 30px/Semibold</h1>
              <p className="text-caption text-muted-foreground">Page titles, main headings</p>
            </div>
            <div>
              <h2>Heading 2 - 24px/Semibold</h2>
              <p className="text-caption text-muted-foreground">Section titles</p>
            </div>
            <div>
              <h3>Heading 3 - 20px/Medium</h3>
              <p className="text-caption text-muted-foreground">Card titles, sub-sections</p>
            </div>
            <div>
              <h4>Heading 4 - 16px/Medium</h4>
              <p className="text-caption text-muted-foreground">List headers, labels</p>
            </div>
            <div>
              <p>Body Text - 15px/Normal - This is the primary text size for paragraphs and content blocks. Optimized for comfortable reading on all devices.</p>
            </div>
            <div>
              <label>Label Text - 14px/Medium</label>
              <p className="text-caption text-muted-foreground">Form labels, metadata</p>
            </div>
            <div>
              <small>Small Text - 13px/Normal - Helper text, descriptions</small>
            </div>
            <div>
              <p className="text-caption">Caption - 12px/Normal - Timestamps, footnotes</p>
            </div>
            <div>
              <p className="text-overline">Overline - 11px/Medium - Category labels</p>
            </div>
          </div>
        </section>

        {/* Button Styles */}
        <section className="space-y-6">
          <div>
            <h2>Button Styles</h2>
            <p className="text-muted-foreground mt-1">
              Clear hierarchy and states for all interactive elements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Buttons */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
              <h3>Primary</h3>
              <div className="space-y-3">
                <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]">
                  Submit Claim
                </button>
                <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2">
                  <Check size={18} />
                  Approve Claim
                </button>
                <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg opacity-50 cursor-not-allowed" disabled>
                  Disabled State
                </button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
              <h3>Secondary</h3>
              <div className="space-y-3">
                <button className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98] border border-border">
                  View Details
                </button>
                <button className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98] border border-border flex items-center justify-center gap-2">
                  <FileText size={18} />
                  Download Report
                </button>
                <button className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg opacity-50 cursor-not-allowed border border-border" disabled>
                  Disabled State
                </button>
              </div>
            </div>

            {/* Ghost Buttons */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
              <h3>Ghost</h3>
              <div className="space-y-3">
                <button className="w-full text-foreground px-6 py-3 rounded-lg transition-all hover:bg-muted active:scale-[0.98]">
                  Cancel
                </button>
                <button className="w-full text-foreground px-6 py-3 rounded-lg transition-all hover:bg-muted active:scale-[0.98] flex items-center justify-center gap-2">
                  <Search size={18} />
                  Search Claims
                </button>
                <button className="w-full text-foreground px-6 py-3 rounded-lg opacity-50 cursor-not-allowed" disabled>
                  Disabled State
                </button>
              </div>
            </div>

            {/* Destructive Buttons */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
              <h3>Destructive</h3>
              <div className="space-y-3">
                <button className="w-full bg-destructive text-destructive-foreground px-6 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]">
                  Reject Claim
                </button>
                <button className="w-full bg-destructive text-destructive-foreground px-6 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2">
                  <X size={18} />
                  Delete Document
                </button>
                <button className="w-full bg-destructive text-destructive-foreground px-6 py-3 rounded-lg opacity-50 cursor-not-allowed" disabled>
                  Disabled State
                </button>
              </div>
            </div>
          </div>

          {/* Button Sizes */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
            <h3>Size Variants</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]">
                Small
              </button>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]">
                Medium
              </button>
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]">
                Large
              </button>
            </div>
          </div>
        </section>

        {/* Form Field Styles */}
        <section className="space-y-6">
          <div>
            <h2>Form Fields</h2>
            <p className="text-muted-foreground mt-1">
              Accessible form controls with clear states and feedback
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Input */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
              <div className="space-y-2">
                <label htmlFor="policy-number">Policy Number</label>
                <input
                  id="policy-number"
                  type="text"
                  placeholder="Enter policy number"
                  className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
                <small className="text-muted-foreground">Required field</small>
              </div>

              <div className="space-y-2">
                <label htmlFor="claim-amount">Claim Amount</label>
                <input
                  id="claim-amount"
                  type="number"
                  placeholder="$0.00"
                  className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="disabled-input">Disabled Input</label>
                <input
                  id="disabled-input"
                  type="text"
                  placeholder="Cannot edit"
                  disabled
                  className="w-full bg-muted border border-input px-4 py-3 rounded-lg opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Select and Textarea */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
              <div className="space-y-2">
                <label htmlFor="claim-type">Claim Type</label>
                <select
                  id="claim-type"
                  className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                >
                  <option>Select type</option>
                  <option>Auto Insurance</option>
                  <option>Home Insurance</option>
                  <option>Health Insurance</option>
                  <option>Life Insurance</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Describe the incident..."
                  className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                ></textarea>
                <small className="text-muted-foreground">Max 500 characters</small>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
              <div className="space-y-2">
                <label>Upload Documents</label>
                <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary hover:bg-muted/50 transition-all cursor-pointer">
                  <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
                  <p>Drag and drop files here</p>
                  <p className="text-caption text-muted-foreground mt-1">or click to browse</p>
                  <small className="text-muted-foreground">PDF, JPG, PNG up to 10MB</small>
                </div>
              </div>
            </div>

            {/* Checkboxes and Radio */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
              <div className="space-y-3">
                <label>Checkbox Options</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-input bg-input-background accent-primary cursor-pointer"
                      defaultChecked
                    />
                    <span>I agree to terms and conditions</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-input bg-input-background accent-primary cursor-pointer"
                    />
                    <span>Send me email notifications</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label>Radio Options</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priority" 
                      className="w-5 h-5 border-input bg-input-background accent-primary cursor-pointer"
                      defaultChecked
                    />
                    <span>Normal Priority</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priority" 
                      className="w-5 h-5 border-input bg-input-background accent-primary cursor-pointer"
                    />
                    <span>High Priority</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Input States */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
            <h3>Input States</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="error-input">Error State</label>
                <input
                  id="error-input"
                  type="text"
                  placeholder="Invalid input"
                  className="w-full bg-input-background border-2 border-destructive px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive"
                />
                <small className="text-destructive flex items-center gap-1">
                  <AlertCircle size={14} />
                  This field is required
                </small>
              </div>

              <div className="space-y-2">
                <label htmlFor="success-input">Success State</label>
                <input
                  id="success-input"
                  type="text"
                  placeholder="Valid input"
                  className="w-full bg-input-background border-2 border-[#10b981] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                />
                <small className="text-[#10b981] flex items-center gap-1">
                  <Check size={14} />
                  Looks good!
                </small>
              </div>

              <div className="space-y-2">
                <label htmlFor="warning-input">Warning State</label>
                <input
                  id="warning-input"
                  type="text"
                  placeholder="Check this"
                  className="w-full bg-input-background border-2 border-[#f59e0b] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
                />
                <small className="text-[#f59e0b] flex items-center gap-1">
                  <AlertCircle size={14} />
                  Please verify
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* Card Components */}
        <section className="space-y-6">
          <div>
            <h2>Card Components</h2>
            <p className="text-muted-foreground mt-1">
              Flexible containers for content with consistent spacing and shadows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Card */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <h3>Basic Card</h3>
              <p className="text-muted-foreground mt-2">
                Default card with subtle shadow and border for content grouping.
              </p>
            </div>

            {/* Elevated Card */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card-elevated">
              <h3>Elevated Card</h3>
              <p className="text-muted-foreground mt-2">
                Elevated card with stronger shadow for modals and important content.
              </p>
            </div>

            {/* Interactive Card */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-card-hover hover:border-primary transition-all cursor-pointer">
              <h3>Interactive Card</h3>
              <p className="text-muted-foreground mt-2">
                Clickable card with hover state for navigation.
              </p>
            </div>

            {/* Status Cards */}
            <div className="bg-card rounded-lg border-2 border-[#10b981] p-6 shadow-card">
              <div className="flex items-start gap-3">
                <div className="bg-[#10b981]/20 p-2 rounded-lg">
                  <Check className="text-[#10b981]" size={20} />
                </div>
                <div>
                  <h4 className="text-[#10b981]">Approved</h4>
                  <p className="text-muted-foreground mt-1">Claim #12345 has been approved</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border-2 border-[#f59e0b] p-6 shadow-card">
              <div className="flex items-start gap-3">
                <div className="bg-[#f59e0b]/20 p-2 rounded-lg">
                  <Clock className="text-[#f59e0b]" size={20} />
                </div>
                <div>
                  <h4 className="text-[#f59e0b]">Pending</h4>
                  <p className="text-muted-foreground mt-1">Awaiting document review</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border-2 border-destructive p-6 shadow-card">
              <div className="flex items-start gap-3">
                <div className="bg-destructive/20 p-2 rounded-lg">
                  <X className="text-destructive" size={20} />
                </div>
                <div>
                  <h4 className="text-destructive">Rejected</h4>
                  <p className="text-muted-foreground mt-1">Missing required documents</p>
                </div>
              </div>
            </div>
          </div>

          {/* Claim Card Example */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="text-primary" size={24} />
                  <h3>Auto Insurance Claim</h3>
                </div>
                <p className="text-overline text-muted-foreground">CLAIM ID: INS-2024-00123</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#10b981]/20 text-[#10b981] px-3 py-1 rounded-full">
                  Approved
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-caption text-muted-foreground">Policy Number</p>
                <p>POL-789456</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Claim Amount</p>
                <p>$5,250.00</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Date Filed</p>
                <p>Dec 10, 2024</p>
              </div>
              <div>
                <p className="text-caption text-muted-foreground">Status Updated</p>
                <p>Dec 14, 2024</p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Grid Demo */}
        <section className="space-y-6">
          <div>
            <h2>Responsive Grid System</h2>
            <p className="text-muted-foreground mt-1">
              Mobile-first grid that scales gracefully from small to large screens
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-card rounded-lg border border-border p-6 shadow-card text-center">
                <div className="text-primary mb-2">
                  <FileText className="mx-auto" size={32} />
                </div>
                <h4>Item {item}</h4>
                <p className="text-caption text-muted-foreground mt-1">Responsive card</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-12 pb-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground">
              Smart Insurance Claim Platform Design System v1.0
            </p>
            <p className="text-caption text-muted-foreground">
              Dark Theme • WCAG AA Compliant • Mobile-First
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}

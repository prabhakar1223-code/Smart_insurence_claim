import React from 'react';
import { ArrowRight, Play, Check } from 'lucide-react';

interface HeroProps {
  onStartClaim: () => void;
}

export function Hero({ onStartClaim }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-sm text-primary">Trusted by 50,000+ policyholders</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-tight text-foreground">
                File Insurance Claims in{' '}
                <span className="text-primary">Minutes,</span>
                <br />
                Not Days
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Skip the paperwork, phone calls, and endless waiting. SmartClaim uses AI to process your insurance claims instantly with 95% faster approval times.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onStartClaim}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 group w-full sm:w-auto"
              >
                Start Your Claim Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button className="bg-secondary text-secondary-foreground px-8 py-4 rounded-lg transition-all hover:bg-muted active:scale-[0.98] border border-border flex items-center justify-center gap-2 w-full sm:w-auto">
                <Play size={20} />
                Watch Demo
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Check className="text-success" size={20} />
                <span className="text-sm text-muted-foreground">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-success" size={20} />
                <span className="text-sm text-muted-foreground">Free to file</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-success" size={20} />
                <span className="text-sm text-muted-foreground">2-min setup</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Dashboard mockup card */}
            <div className="bg-card border border-border rounded-xl shadow-card-elevated p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-overline text-muted-foreground">ACTIVE CLAIM</p>
                  <h3 className="mt-1 text-foreground">Auto Insurance</h3>
                </div>
                <div className="bg-success/20 text-success px-3 py-1 rounded-full text-sm">
                  Approved
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing</span>
                  <span className="text-primary">100%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-caption text-muted-foreground">Claim Amount</p>
                  <p className="text-xl text-success">$5,250</p>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Processing Time</p>
                  <p className="text-xl text-foreground">2 mins</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-start gap-3">
                  <div className="bg-success p-1 rounded-full mt-1">
                    <Check size={12} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">Claim Approved</p>
                    <p className="text-caption text-muted-foreground">Just now</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-success p-1 rounded-full mt-1">
                    <Check size={12} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">Documents Verified</p>
                    <p className="text-caption text-muted-foreground">2 mins ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-success p-1 rounded-full mt-1">
                    <Check size={12} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">Claim Submitted</p>
                    <p className="text-caption text-muted-foreground">4 mins ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stats - hidden on mobile, shown on md and up */}
            <div className="hidden md:block absolute -right-4 -top-4 bg-card border border-border rounded-lg p-4 shadow-card-hover z-10">
              <p className="text-caption text-muted-foreground">Avg. Approval Time</p>
              <p className="text-2xl text-primary">3 mins</p>
            </div>

            <div className="hidden md:block absolute -left-4 -bottom-4 bg-card border border-border rounded-lg p-4 shadow-card-hover z-10">
              <p className="text-caption text-muted-foreground">Success Rate</p>
              <p className="text-2xl text-success">98.5%</p>
            </div>

            {/* Mobile-friendly stats - shown on mobile only */}
            <div className="md:hidden flex justify-between mt-6 pt-6 border-t border-border">
              <div className="bg-card border border-border rounded-lg p-4 shadow-card-hover flex-1 mr-2">
                <p className="text-caption text-muted-foreground">Avg. Approval Time</p>
                <p className="text-2xl text-primary">3 mins</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 shadow-card-hover flex-1 ml-2">
                <p className="text-caption text-muted-foreground">Success Rate</p>
                <p className="text-2xl text-success">98.5%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
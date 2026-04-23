import React from 'react';
import { Scan, Eye, Shield, Zap, FileCheck, Bell, Lock, TrendingUp } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Scan,
      title: 'Smart OCR Technology',
      description: 'Automatically extract data from photos and documents. No manual typing needed.',
      benefits: ['99% accuracy', 'Multi-language support', 'Handwriting recognition']
    },
    {
      icon: Eye,
      title: 'Real-Time Tracking',
      description: 'See exactly where your claim is at every step. Complete transparency from submission to approval.',
      benefits: ['Live updates', 'Timeline view', 'Instant notifications']
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Your data is encrypted end-to-end with military-grade security. SOC 2 & ISO 27001 certified.',
      benefits: ['256-bit encryption', 'Secure storage', 'GDPR compliant']
    },
    {
      icon: Zap,
      title: 'Lightning Fast Approval',
      description: 'AI-powered verification processes claims 95% faster than traditional methods.',
      benefits: ['2-5 min approval', 'Auto-validation', 'Smart routing']
    },
    {
      icon: FileCheck,
      title: 'Auto-Verification',
      description: 'Intelligent system checks for missing documents and errors before submission.',
      benefits: ['Error detection', 'Document check', 'Completeness validation']
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get instant updates via SMS, email, and push notifications at every milestone.',
      benefits: ['Multi-channel alerts', 'Custom preferences', 'No spam']
    },
    {
      icon: Lock,
      title: 'Data Protection',
      description: 'Your personal information is never shared. Full compliance with privacy regulations.',
      benefits: ['Zero data sharing', 'Privacy controls', 'Audit logs']
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'Track your claim history, spending patterns, and get insights on policy optimization.',
      benefits: ['Claim history', 'Spending insights', 'Policy recommendations']
    }
  ];

  return (
    <section id="features" className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <p className="text-overline text-primary mb-3">FEATURES</p>
          <h2 className="mb-4 text-foreground">Everything You Need for Hassle-Free Claims</h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to make insurance claims simple, fast, and stress-free.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-card-hover hover:border-primary/50 transition-all group"
            >
              {/* Icon */}
              <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="text-primary" size={24} />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground mb-4">{feature.description}</p>

              {/* Benefits */}
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center shadow-card">
            <p className="text-4xl text-primary mb-2">50K+</p>
            <p className="text-muted-foreground">Claims Processed</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center shadow-card">
            <p className="text-4xl text-success mb-2">98.5%</p>
            <p className="text-muted-foreground">Approval Rate</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center shadow-card">
            <p className="text-4xl text-accent mb-2">3 min</p>
            <p className="text-muted-foreground">Avg. Processing Time</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center shadow-card">
            <p className="text-4xl text-warning mb-2">24/7</p>
            <p className="text-muted-foreground">Support Available</p>
          </div>
        </div>
      </div>
    </section>
  );
}
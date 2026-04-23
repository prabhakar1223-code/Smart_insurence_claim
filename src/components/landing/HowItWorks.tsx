import React from 'react';
import { Camera, Zap, CheckCircle, Bell } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Camera,
      number: '01',
      title: 'Snap & Upload',
      description: 'Take photos of damage and documents. Our AI extracts all information instantly—no typing required.',
      time: '30 seconds',
      color: 'primary'
    },
    {
      icon: Zap,
      number: '02',
      title: 'AI Auto-Fill',
      description: 'Our OCR technology reads your documents and auto-fills the entire claim form. Review and submit.',
      time: '1 minute',
      color: 'accent'
    },
    {
      icon: CheckCircle,
      number: '03',
      title: 'Instant Verification',
      description: 'AI verifies documents, checks policy coverage, and validates claim details in real-time.',
      time: '30 seconds',
      color: '[#10b981]'
    },
    {
      icon: Bell,
      number: '04',
      title: 'Get Approved',
      description: 'Track status in real-time. Get instant notifications. Approval in minutes, not weeks.',
      time: '2-5 minutes',
      color: '[#8b5cf6]'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <p className="text-overline text-primary mb-3">HOW IT WORKS</p>
          <h2 className="mb-4 text-foreground">File Your Claim in 4 Simple Steps</h2>
          <p className="text-lg text-muted-foreground">
            No phone calls. No paperwork. No waiting. Just snap, submit, and track—all from your phone.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line - desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-border -z-10">
                  <div className="h-full bg-primary/30 w-full"></div>
                </div>
              )}

              {/* Card */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all h-full">
                {/* Icon */}
                <div className={`${step.color === 'primary' ? 'bg-primary/10 border-primary/20' :
                    step.color === 'accent' ? 'bg-accent/10 border-accent/20' :
                      step.color === '[#10b981]' ? 'bg-success/10 border-success/20' :
                        'bg-[#8b5cf6]/10 border-[#8b5cf6]/20'
                  } p-4 rounded-lg w-fit mb-4 relative`}>
                  <step.icon className={`${step.color === 'primary' ? 'text-primary' :
                      step.color === 'accent' ? 'text-accent' :
                        step.color === '[#10b981]' ? 'text-success' :
                          'text-[#8b5cf6]'
                    }`} size={28} />
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground mb-4">{step.description}</p>

                {/* Time indicator */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${step.color === 'primary' ? 'bg-primary/10 border border-primary/20' :
                    step.color === 'accent' ? 'bg-accent/10 border border-accent/20' :
                      step.color === '[#10b981]' ? 'bg-success/10 border border-success/20' :
                        'bg-[#8b5cf6]/10 border border-[#8b5cf6]/20'
                  }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${step.color === 'primary' ? 'bg-primary' :
                      step.color === 'accent' ? 'bg-accent' :
                        step.color === '[#10b981]' ? 'bg-success' :
                          'bg-[#8b5cf6]'
                    }`}></div>
                  <span className={`text-sm ${step.color === 'primary' ? 'text-primary' :
                      step.color === 'accent' ? 'text-accent' :
                        step.color === '[#10b981]' ? 'text-success' :
                          'text-[#8b5cf6]'
                    }`}>{step.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>



        {/* CTA */}
        <div className="mt-12 text-center">
          <button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg transition-all hover:opacity-90 active:scale-[0.98] w-full sm:w-auto">
            Try It Now - It's Free
          </button>
          <p className="text-caption text-muted-foreground mt-3">No credit card required • 2-minute setup</p>
        </div>
      </div>
    </section>
  );
}
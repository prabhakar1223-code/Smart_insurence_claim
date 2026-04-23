import React from 'react';
import { Clock, FileX, PhoneOff, AlertTriangle } from 'lucide-react';

export function ProblemSection() {
  const problems = [
    {
      icon: Clock,
      title: 'Endless Waiting',
      description: 'Traditional claims take 15-30 days to process. You wait weeks just to hear back.',
      stat: '15-30 days'
    },
    {
      icon: FileX,
      title: 'Paperwork Nightmare',
      description: 'Mountains of forms, photocopies, and physical documents. One missing paper restarts everything.',
      stat: '12+ documents'
    },
    {
      icon: PhoneOff,
      title: 'No Transparency',
      description: 'Endless phone calls to check status. No one knows where your claim is in the process.',
      stat: '8+ calls'
    },
    {
      icon: AlertTriangle,
      title: 'High Rejection Rate',
      description: 'Claims rejected for minor errors or missing information. Start all over again.',
      stat: '40% rejection'
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-transparent to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <p className="text-overline text-destructive mb-3">THE PROBLEM</p>
          <h2 className="mb-4 text-foreground">Why Traditional Insurance Claims Are Broken</h2>
          <p className="text-lg text-muted-foreground">
            Filing an insurance claim shouldn't feel like a full-time job. Yet millions of policyholders face these frustrations every day.
          </p>
        </div>

        {/* Problem Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg w-fit mb-4">
                <problem.icon className="text-destructive" size={24} />
              </div>
              <h3 className="mb-2 text-foreground">{problem.title}</h3>
              <p className="text-muted-foreground mb-4">{problem.description}</p>
              <div className="pt-4 border-t border-border">
                <p className="text-destructive">{problem.stat}</p>
                <p className="text-caption text-muted-foreground">Average impact</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
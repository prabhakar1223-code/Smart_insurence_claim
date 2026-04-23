import React from 'react';
import { Shield, Lock, Eye, FileCheck, Server, CheckCircle } from 'lucide-react';

export function Security() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data is encrypted using AES-256 encryption, the same standard used by banks and governments.'
    },
    {
      icon: Server,
      title: 'Secure Cloud Storage',
      description: 'Your documents are stored on SOC 2 Type II certified servers with automatic backups and redundancy.'
    },
    {
      icon: Eye,
      title: 'Privacy First',
      description: 'We never sell or share your data. You control who sees your information and for how long.'
    },
    {
      icon: FileCheck,
      title: 'Compliance Ready',
      description: 'Fully compliant with GDPR, HIPAA, and insurance industry regulations across all regions.'
    }
  ];

  const certifications = [
    'ISO 27001',
  ];

  return (
    <section id="security" className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <p className="text-overline text-success mb-3">SECURITY & COMPLIANCE</p>
              <h2 className="mb-4 text-foreground">Your Data is Protected at Every Step</h2>
              <p className="text-lg text-muted-foreground">
                We take security seriously. SmartClaim uses enterprise-grade security measures to protect your personal information and documents.
              </p>
            </div>

            {/* Security Features */}
            <div className="space-y-6">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="bg-success/10 border border-success/20 p-3 rounded-lg">
                    <feature.icon className="text-success" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 text-foreground">{feature.title}</h4>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">CERTIFIED & COMPLIANT</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {certifications.map((cert, index) => (
                  <div 
                    key={index}
                    className="bg-card border border-border rounded-lg px-4 py-3 text-center"
                  >
                    <p className="text-sm text-foreground">{cert}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Main security card */}
            <div className="bg-card border-2 border-success/20 rounded-xl p-8 shadow-card-elevated">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 border-2 border-success/20 rounded-full mb-4">
                  <Shield className="text-success" size={40} />
                </div>
                <h3 className="mb-2 text-foreground">Protected & Verified</h3>
                <p className="text-muted-foreground">Your claim is secured with multiple layers of protection</p>
              </div>

              {/* Security checklist */}
              <div className="space-y-4">
          
                <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/10 rounded-lg">
                  <CheckCircle className="text-success" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Access Control</p>
                    <p className="text-caption text-muted-foreground">Multi-factor authentication</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/10 rounded-lg">
                  <CheckCircle className="text-success" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Regular Audits</p>
                    <p className="text-caption text-muted-foreground">Third-party security testing</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/10 rounded-lg">
                  <CheckCircle className="text-success" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Data Backup</p>
                    <p className="text-caption text-muted-foreground">Automatic daily backups</p>
                  </div>
                </div>
              </div>

              {/* Trust badge */}
              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-caption text-muted-foreground mb-2">TRUSTED BY</p>
                <p className="text-lg text-foreground">50,000+ Policyholders</p>
              </div>
            </div>

          </div>
        </div>

        
      </div>
    </section>
  );
}
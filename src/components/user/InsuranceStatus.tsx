import React from 'react';
import { Shield, Calendar, IndianRupee, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function InsuranceStatus() {
  const policies = [
    {
      id: 'POL-2024-001',
      type: 'Health Insurance',
      icon: '🏥',
      provider: 'HealthCare Plus',
      policyNumber: 'HCP-789456',
      status: 'Active',
      statusColor: 'success',
      // MODIFIED: Changed to ₹
      coverage: '₹500,000',
      premium: '₹450/month',
      startDate: 'Jan 1, 2024',
      endDate: 'Dec 31, 2024',
      daysRemaining: 180,
    },
    {
      id: 'POL-2024-002',
      type: 'Auto Insurance',
      icon: '🚗',
      provider: 'SafeDrive Insurance',
      policyNumber: 'SD-456123',
      status: 'Active',
      statusColor: 'success',
      // MODIFIED: Changed to ₹
      coverage: '₹300,000',
      premium: '₹200/month',
      startDate: 'Mar 15, 2024',
      endDate: 'Mar 14, 2025',
      daysRemaining: 250,
    },
    {
      id: 'POL-2024-003',
      type: 'Home Insurance',
      icon: '🏠',
      provider: 'HomeGuard Insurance',
      policyNumber: 'HG-321789',
      status: 'Expiring Soon',
      statusColor: 'warning',
      // MODIFIED: Changed to ₹
      coverage: '₹2,000,000',
      premium: '₹800/month',
      startDate: 'Jan 1, 2024',
      endDate: 'Dec 31, 2024',
      daysRemaining: 30,
    },
    {
      id: 'POL-2023-004',
      type: 'Life Insurance',
      icon: '❤️',
      provider: 'LifeSecure',
      policyNumber: 'LS-987654',
      status: 'Expired',
      statusColor: 'destructive',
      // MODIFIED: Changed to ₹
      coverage: '₹1,000,000',
      premium: '₹350/month',
      startDate: 'Jan 1, 2023',
      endDate: 'Dec 31, 2023',
      daysRemaining: -150,
    },
  ];

  const getStatusBadge = (status: string, color: string) => {
    const colorClasses = {
      success: 'bg-success/20 text-success',
      warning: 'bg-warning/20 text-warning',
      destructive: 'bg-destructive/20 text-destructive',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm ${colorClasses[color as keyof typeof colorClasses]}`}>
        {status}
      </span>
    );
  };

  const getStatusIcon = (color: string) => {
    switch (color) {
      case 'success':
        return <CheckCircle size={20} className="text-success" />;
      case 'warning':
        return <Clock size={20} className="text-warning" />;
      case 'destructive':
        return <AlertCircle size={20} className="text-destructive" />;
      default:
        return <Shield size={20} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Insurance Policies</h1>
        <p className="text-muted-foreground">View and manage your active insurance policies</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Policies</p>
            <Shield size={20} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{policies.length}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Active Policies</p>
            <CheckCircle size={20} className="text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {policies.filter(p => p.status === 'Active').length}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Coverage</p>
            {/* MODIFIED: Changed Icon to IndianRupee */}
            <IndianRupee size={20} className="text-primary" />
          </div>
          {/* MODIFIED: Changed to ₹ */}
          <p className="text-2xl font-bold text-foreground">₹5,00,000</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Monthly Premium</p>
            <Calendar size={20} className="text-primary" />
          </div>
          {/* MODIFIED: Changed to ₹ */}
          <p className="text-2xl font-bold text-foreground">₹1,800</p>
        </div>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {policies.map((policy) => (
          <div key={policy.id} className="bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{policy.icon}</div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-foreground">{policy.type}</h3>
                    {getStatusBadge(policy.status, policy.statusColor)}
                  </div>
                  <p className="text-muted-foreground">{policy.provider}</p>
                  <p className="text-sm text-muted-foreground mt-1">Policy: {policy.policyNumber}</p>
                </div>
              </div>
              {getStatusIcon(policy.statusColor)}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Coverage Amount</p>
                <p className="text-foreground font-medium">{policy.coverage}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Premium</p>
                <p className="text-foreground font-medium">{policy.premium}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valid Period</p>
                <p className="text-foreground font-medium">{policy.startDate} - {policy.endDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {policy.daysRemaining > 0 ? 'Days Remaining' : 'Days Expired'}
                </p>
                <p className={`font-medium ${
                  policy.daysRemaining > 60 ? 'text-success' :
                  policy.daysRemaining > 0 ? 'text-warning' :
                  'text-destructive'
                }`}>
                  {Math.abs(policy.daysRemaining)} days
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                View Details
              </button>
              <button className="flex-1 bg-card border border-border text-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                Download Policy
              </button>
              {policy.status === 'Expiring Soon' && (
                <button className="flex-1 bg-warning/20 text-warning border border-warning/20 px-4 py-2 rounded-lg hover:bg-warning/30 transition-colors">
                  Renew Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Policy Button */}
      <button className="w-full mt-6 bg-card border-2 border-dashed border-border text-foreground px-6 py-4 rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
        <FileText size={20} />
        Add New Policy
      </button>
    </div>
  );
}
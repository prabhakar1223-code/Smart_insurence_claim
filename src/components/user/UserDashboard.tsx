import React from 'react';
import { FileText, Clock, CheckCircle, XCircle, Plus, AlertCircle, TrendingUp, IndianRupee } from 'lucide-react';

interface UserDashboardProps {
  onStartClaim: () => void;
  onViewClaim: (claimId: string) => void;
  onStartApplication?: () => void;
}

export function UserDashboard({ onStartClaim, onViewClaim, onStartApplication }: UserDashboardProps) {
  const stats = [
    { label: 'Active Claims', value: '2', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Approved Claims', value: '8', icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    // MODIFIED: Changed Icon to IndianRupee and symbol to ₹
    { label: 'Total Claimed', value: '₹24,500', icon: IndianRupee, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  const activeClaims = [
    {
      id: 'CLM-2024-8721',
      type: 'Auto Insurance',
      status: 'Under Review',
      statusColor: 'warning',
      // MODIFIED: Changed to ₹
      amount: '₹5,250',
      date: 'Dec 10, 2024',
      progress: 60,
    },
    {
      id: 'CLM-2024-8650',
      type: 'Health Insurance',
      status: 'Processing',
      statusColor: 'primary',
      // MODIFIED: Changed to ₹
      amount: '₹2,100',
      date: 'Dec 8, 2024',
      progress: 40,
    },
  ];

  const recentActivity = [
    { action: 'Claim approved', claim: 'CLM-2024-8543', time: '2 hours ago', icon: CheckCircle, color: 'text-success' },
    { action: 'Document uploaded', claim: 'CLM-2024-8721', time: '5 hours ago', icon: FileText, color: 'text-primary' },
    { action: 'Claim submitted', claim: 'CLM-2024-8650', time: '1 day ago', icon: TrendingUp, color: 'text-warning' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning': return 'bg-warning/20 text-warning';
      case 'success': return 'bg-success/20 text-success';
      case 'primary': return 'bg-primary/20 text-primary';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Welcome back, Sudhan!</h1>
        <p className="text-muted-foreground">Here's what's happening with your claims</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
              <h3 className="text-foreground">{stat.value}</h3>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-foreground mb-2">File a New Claim</h3>
              <p className="text-sm text-muted-foreground">Submit a claim for existing insurance policy</p>
            </div>
            <button
              onClick={onStartClaim}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap w-full justify-center"
            >
              <Plus size={20} />
              Start New Claim
            </button>
          </div>
        </div>
        
        {onStartApplication && (
          <div className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-2xl p-6">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-foreground mb-2">Submit a new Policy</h3>
                <p className="text-sm text-muted-foreground">Submit a new Insurance application</p>
              </div>
              <button
                onClick={onStartApplication}
                className="bg-accent text-accent-foreground px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap w-full justify-center"
              >
                <Plus size={20} />
                New Application
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Active Claims - 2 columns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-foreground">Active Claims</h2>
            <button className="text-primary hover:underline">View All</button>
          </div>

          <div className="space-y-4">
            {activeClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all cursor-pointer"
                onClick={() => onViewClaim(claim.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-foreground">{claim.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(claim.statusColor)}`}>
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{claim.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground">{claim.amount}</p>
                    <p className="text-sm text-muted-foreground mt-1">{claim.date}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">{claim.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${claim.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activeClaims.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <div className="bg-muted/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-foreground mb-2">No Active Claims</h3>
              <p className="text-muted-foreground mb-6">You don't have any claims in progress</p>
              <button
                onClick={onStartClaim}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                File Your First Claim
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity - 1 column */}
        <div>
          <h2 className="text-foreground mb-6">Recent Activity</h2>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="bg-card border border-border rounded-xl p-4 shadow-card">
                  <div className="flex items-start gap-3">
                    <div className={`${activity.color} shrink-0 mt-1`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground mt-1">{activity.claim}</p>
                      <p className="text-sm text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Help Card */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mt-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="text-foreground mb-2">Need Help?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Our support team is available 24/7 to assist you
                </p>
                <button className="text-accent hover:underline">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
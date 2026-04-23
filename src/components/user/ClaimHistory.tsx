import React, { useState } from 'react';
import { Search, Filter, Download, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface ClaimData {
  claimId: string;
  validationData: {
    status: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
    issues?: string[];
    extractedData?: any;
    claimType: string;
    amount: string;
    submittedDate: string;
  };
}

interface ClaimHistoryProps {
  claimsData?: ClaimData[];
  onViewClaim: (claimId: string) => void;
}

export function ClaimHistory({ claimsData = [], onViewClaim }: ClaimHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const mockClaims = [
    {
      id: 'CLM-2024-8721',
      type: 'Auto Insurance',
      status: 'Under Review',
      statusType: 'warning',
      // MODIFIED: Changed to ₹
      amount: '₹5,250',
      date: 'Dec 23, 2024',
      description: 'Rear bumper damage from parking incident',
    },
    {
      id: 'CLM-2024-8650',
      type: 'Health Insurance',
      status: 'Processing',
      statusType: 'primary',
      // MODIFIED: Changed to ₹
      amount: '₹2,100',
      date: 'Dec 8, 2024',
      description: 'Emergency room visit for injury treatment',
    },
    {
      id: 'CLM-2024-8543',
      type: 'Home Insurance',
      status: 'Approved',
      statusType: 'success',
      // MODIFIED: Changed to ₹
      amount: '₹8,400',
      date: 'Dec 1, 2024',
      description: 'Water damage from burst pipe in kitchen',
    },
    {
      id: 'CLM-2024-8421',
      type: 'Auto Insurance',
      status: 'Approved',
      statusType: 'success',
      // MODIFIED: Changed to ₹
      amount: '₹3,200',
      date: 'Nov 22, 2024',
      description: 'Windshield replacement after crack',
    },
    {
      id: 'CLM-2024-8354',
      type: 'Health Insurance',
      status: 'Approved',
      statusType: 'success',
      // MODIFIED: Changed to ₹
      amount: '₹1,850',
      date: 'Nov 15, 2024',
      description: 'Dental procedure coverage',
    },
    {
      id: 'CLM-2024-8201',
      type: 'Home Insurance',
      status: 'Rejected',
      statusType: 'destructive',
      // MODIFIED: Changed to ₹
      amount: '₹12,000',
      date: 'Nov 5, 2024',
      description: 'Flood damage - not covered by policy',
    },
    {
      id: 'CLM-2024-8098',
      type: 'Auto Insurance',
      status: 'Approved',
      statusType: 'success',
      // MODIFIED: Changed to ₹
      amount: '₹2,750',
      date: 'Oct 28, 2024',
      description: 'Side mirror replacement',
    },
    {
      id: 'CLM-2024-7965',
      type: 'Health Insurance',
      status: 'Approved',
      statusType: 'success',
      // MODIFIED: Changed to ₹
      amount: '₹4,200',
      date: 'Oct 12, 2024',
      description: 'Medical imaging and consultation',
    },
  ];

  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case 'success':
        return <CheckCircle size={18} className="text-success" />;
      case 'destructive':
        return <XCircle size={18} className="text-destructive" />;
      case 'warning':
        return <Clock size={18} className="text-warning" />;
      default:
        return <Clock size={18} className="text-primary" />;
    }
  };

  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'success':
        return 'bg-success/20 text-success';
      case 'destructive':
        return 'bg-destructive/20 text-destructive';
      case 'warning':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-primary/20 text-primary';
    }
  };

  // Use real claims data if available, otherwise use mock data
  const claims = claimsData.length > 0 ? claimsData.map(claim => ({
    id: claim.claimId,
    type: claim.validationData.claimType,
    status: claim.validationData.status === 'APPROVED' ? 'Approved' :
            claim.validationData.status === 'REJECTED' ? 'Rejected' : 'Under Review',
    statusType: claim.validationData.status === 'APPROVED' ? 'success' :
                claim.validationData.status === 'REJECTED' ? 'destructive' : 'warning',
    amount: claim.validationData.amount,
    date: claim.validationData.submittedDate,
    description: `${claim.validationData.claimType} claim`,
  })) : mockClaims;

  const filteredClaims = claims.filter(claim => {
    const matchesSearch =
      claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || claim.status.toLowerCase().includes(filterStatus.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Claims', value: claims.length },
    { label: 'Approved', value: claims.filter((c) => c.statusType === 'success').length },
    { label: 'Pending', value: claims.filter((c) => c.statusType === 'warning' || c.statusType === 'primary').length },
    { label: 'Rejected', value: claims.filter((c) => c.statusType === 'destructive').length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Claim History</h1>
        <p className="text-muted-foreground">View and manage all your past claims</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-4 shadow-card">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <h3 className="text-foreground">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search claims by ID, type, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="review">Under Review</option>
              <option value="processing">Processing</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-foreground transition-colors whitespace-nowrap">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-foreground">Claim ID</th>
                <th className="px-6 py-4 text-left text-foreground">Type</th>
                <th className="px-6 py-4 text-left text-foreground">Description</th>
                <th className="px-6 py-4 text-left text-foreground">Amount</th>
                <th className="px-6 py-4 text-left text-foreground">Date</th>
                <th className="px-6 py-4 text-left text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClaims.map((claim) => (
                <tr
                  key={claim.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onViewClaim(claim.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      <span className="text-foreground">{claim.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{claim.type}</td>
                  <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">{claim.description}</td>
                  <td className="px-6 py-4 text-foreground">{claim.amount}</td>
                  <td className="px-6 py-4 text-muted-foreground">{claim.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(claim.statusType)}
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(claim.statusType)}`}>
                        {claim.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewClaim(claim.id);
                      }}
                      className="text-primary hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => onViewClaim(claim.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-primary" />
                    <span className="text-foreground">{claim.id}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{claim.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(claim.statusType)}
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(claim.statusType)}`}>
                    {claim.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{claim.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-foreground">{claim.amount}</span>
                <span className="text-sm text-muted-foreground">{claim.date}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredClaims.length === 0 && (
          <div className="p-12 text-center">
            <div className="bg-muted/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-foreground mb-2">No Claims Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
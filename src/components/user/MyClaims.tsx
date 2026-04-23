import React, { useState } from 'react';
import { FileText, Filter, Search, Calendar, IndianRupee, CheckCircle, Clock, XCircle, AlertCircle, X } from 'lucide-react';
import { ClaimStatus } from './ClaimStatus';
import { generateClaimPDF } from '../../services/pdfService';

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
  fraudScore?: number;
  fraudSeverity?: string;
  fraudFlags?: string[];
}

interface MyClaimsProps {
  claimsData?: ClaimData[];
  onViewClaim?: (claimId: string) => void;
}

export function MyClaims({ claimsData = [], onViewClaim }: MyClaimsProps) {
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<ClaimData | null>(null);
  const [showClaimDetails, setShowClaimDetails] = useState(false);

  const mockClaims = [
    {
      id: '#CLM-2024-1234',
      type: 'Health Insurance',
      icon: '🏥',
      description: 'Medical treatment for injury',
      // MODIFIED: Changed to ₹
      amount: '₹5,250',
      date: 'Dec 10, 2024',
      status: 'APPROVED',
      statusColor: 'success',
      provider: 'HealthCare Plus',
    },
    {
      id: '#CLM-2024-1235',
      type: 'Auto Insurance',
      icon: '🚗',
      description: 'Vehicle damage repair',
      // MODIFIED: Changed to ₹
      amount: '₹3,800',
      date: 'Dec 8, 2024',
      status: 'MANUAL_REVIEW',
      statusColor: 'warning',
      provider: 'SafeDrive Insurance',
    },
    {
      id: '#CLM-2024-1236',
      type: 'Home Insurance',
      icon: '🏠',
      description: 'Water damage repair',
      // MODIFIED: Changed to ₹
      amount: '₹12,500',
      date: 'Dec 5, 2024',
      status: 'APPROVED',
      statusColor: 'success',
      provider: 'HomeGuard Insurance',
    },
    {
      id: '#CLM-2024-1237',
      type: 'Health Insurance',
      icon: '🏥',
      description: 'Dental procedure',
      // MODIFIED: Changed to ₹
      amount: '₹1,200',
      date: 'Dec 1, 2024',
      status: 'REJECTED',
      statusColor: 'destructive',
      provider: 'HealthCare Plus',
    },
    {
      id: '#CLM-2024-1238',
      type: 'Life Insurance',
      icon: '❤️',
      description: 'Critical illness claim',
      // MODIFIED: Changed to ₹
      amount: '₹50,000',
      date: 'Nov 28, 2024',
      status: 'MANUAL_REVIEW',
      statusColor: 'warning',
      provider: 'LifeSecure',
    },
  ];

  // Use real claims data if available, otherwise use mock data
  const claims = claimsData.length > 0 ? claimsData.map(claim => ({
    id: claim.claimId,
    type: claim.validationData.claimType,
    icon: claim.validationData.claimType.includes('Health') ? '🏥' :
      claim.validationData.claimType.includes('Auto') || claim.validationData.claimType.includes('Vehicle') ? '🚗' :
        claim.validationData.claimType.includes('Home') ? '🏠' : '❤️',
    description: `${claim.validationData.claimType} claim`,
    amount: claim.validationData.amount,
    date: claim.validationData.submittedDate,
    status: claim.validationData.status,
    statusColor: claim.validationData.status === 'APPROVED' ? 'success' :
      claim.validationData.status === 'REJECTED' ? 'destructive' : 'warning',
    provider: 'Insurance Provider',
  })) : mockClaims;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { text: 'Approved', icon: CheckCircle };
      case 'REJECTED':
        return { text: 'Rejected', icon: XCircle };
      case 'MANUAL_REVIEW':
        return { text: 'Under Review', icon: Clock };
      default:
        return { text: 'Pending', icon: AlertCircle };
    }
  };

  const getStatusBadge = (status: string, color: string) => {
    const colorClasses = {
      success: 'bg-success/20 text-success',
      warning: 'bg-warning/20 text-warning',
      destructive: 'bg-destructive/20 text-destructive',
    };

    const statusDisplay = getStatusDisplay(status);
    const Icon = statusDisplay.icon;

    return (
      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon size={16} />
        {statusDisplay.text}
      </span>
    );
  };

  const handleViewDetails = (claim: any) => {
    // Find the original claim data from claimsData
    const originalClaim = claimsData.find(c => c.claimId === claim.id);
    if (originalClaim) {
      setSelectedClaim(originalClaim);
      setShowClaimDetails(true);
    } else {
      // If not found, create a mock claim data
      setSelectedClaim({
        claimId: claim.id,
        validationData: {
          status: claim.status as 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW',
          claimType: claim.type,
          amount: claim.amount,
          submittedDate: claim.date,
        }
      });
      setShowClaimDetails(true);
    }
  };

  const handleDownloadDocument = async (claim: any) => {
    try {
      // Find the original claim data from claimsData
      const originalClaim = claimsData.find(c => c.claimId === claim.id);

      // Prepare claim data for PDF generation
      const claimDataForPDF = {
        claimId: claim.id,
        type: claim.type,
        description: claim.description,
        amount: claim.amount,
        date: claim.date,
        status: claim.status,
        provider: claim.provider,
        validationData: originalClaim?.validationData,
        fraudScore: originalClaim?.fraudScore,
        fraudSeverity: originalClaim?.fraudSeverity,
        fraudFlags: originalClaim?.fraudFlags,
      };

      console.log('Generating PDF for claim:', claim.id);
      await generateClaimPDF(claimDataForPDF);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesFilter = filter === 'all' ||
      (filter === 'approved' && claim.status === 'APPROVED') ||
      (filter === 'pending' && claim.status === 'MANUAL_REVIEW') ||
      (filter === 'rejected' && claim.status === 'REJECTED');

    const matchesSearch = claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-foreground mb-2">My Claims</h1>
        <p className="text-muted-foreground">Track and manage all your insurance claims</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Claims</p>
            <FileText size={20} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{claims.length}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Approved</p>
            <CheckCircle size={20} className="text-success" />
          </div>
          <p className="text-2xl font-bold text-success">
            {claims.filter(c => c.status === 'APPROVED').length}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Under Review</p>
            <Clock size={20} className="text-warning" />
          </div>
          <p className="text-2xl font-bold text-warning">
            {claims.filter(c => c.status === 'MANUAL_REVIEW').length}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            {/* MODIFIED: Changed Icon to IndianRupee */}
            <IndianRupee size={20} className="text-primary" />
          </div>
          {/* MODIFIED: Changed to ₹ */}
          <p className="text-2xl font-bold text-foreground">₹72,750</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg transition-all ${filter === 'approved'
                ? 'bg-success text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-all ${filter === 'pending'
                ? 'bg-warning text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg transition-all ${filter === 'rejected'
                ? 'bg-destructive text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.length > 0 ? (
          filteredClaims.map((claim) => (
            <div key={claim.id} className="bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{claim.icon}</div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-foreground">{claim.id}</h3>
                      {getStatusBadge(claim.status, claim.statusColor)}
                    </div>
                    <p className="text-muted-foreground">{claim.type}</p>
                    <p className="text-sm text-muted-foreground mt-1">{claim.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Claim Amount</p>
                  <p className="text-foreground font-medium text-lg">{claim.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Submitted Date</p>
                  <p className="text-foreground font-medium">{claim.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Provider</p>
                  <p className="text-foreground font-medium">{claim.provider}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleViewDetails(claim)}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDownloadDocument(claim)}
                  className="flex-1 bg-card border border-border text-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  Download Documents
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <FileText size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground mb-2">No claims found</p>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Claim Details Modal */}
      {showClaimDetails && selectedClaim && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header with Close Button */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-xl font-bold text-foreground">Claim Details</h2>
              <button
                onClick={() => setShowClaimDetails(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <ClaimStatus
                claimId={selectedClaim.claimId}
                onBack={() => setShowClaimDetails(false)}
                validationData={selectedClaim.validationData}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
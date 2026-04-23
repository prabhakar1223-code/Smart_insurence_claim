import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, AlertCircle, User, Mail, Calendar, DollarSign, Edit, LogOut, ArrowRight, Shield } from 'lucide-react';
import { ApplicationData } from '../user/ApplicationStatus';

interface ClaimData {
  id: string;
  userName: string;
  userEmail: string;
  claimType: string;
  amount: string;
  status: string;
  submittedDate: string;
  reviewedDate?: string;
  adminNotes?: string;
  issues?: string[];
}

interface ClaimsApplicationsManagerProps {
  claims: ClaimData[];
  applications: ApplicationData[];
  onUpdateClaimStatus: (claimId: string, status: string, notes: string) => void;
  onApproveApplication: (applicationId: string) => void;
  onRejectApplication: (applicationId: string, reason: string, requiredInfo: string[]) => void;
  onLogout?: () => void;
}

export function ClaimsApplicationsManager({ 
  claims, 
  applications, 
  onUpdateClaimStatus,
  onApproveApplication,
  onRejectApplication,
  onLogout
}: ClaimsApplicationsManagerProps) {
  const [activeTab, setActiveTab] = useState<'claims' | 'applications'>('claims');
  const [selectedClaim, setSelectedClaim] = useState<ClaimData | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'pending':
      case 'manual_review': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const handleUpdateStatus = () => {
    if (selectedClaim && newStatus) {
      onUpdateClaimStatus(selectedClaim.id, newStatus, adminNotes);
      setShowStatusModal(false);
      setSelectedClaim(null);
      setNewStatus('');
      setAdminNotes('');
    }
  };

  const openStatusModal = (claim: ClaimData) => {
    setSelectedClaim(claim);
    setNewStatus(claim.status);
    setAdminNotes(claim.adminNotes || '');
    setShowStatusModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Management Console</h1>
          <p className="text-muted-foreground mt-1 text-base">Process all user submissions efficiently.</p>
        </div>
       
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Claims', value: claims.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Applications', value: applications.length, icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Pending Claims', value: claims.filter(c => ['pending', 'manual_review'].includes(c.status.toLowerCase())).length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Pending Apps', value: applications.filter(a => a.status === 'pending').length, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
              <span className="text-3xl font-bold text-foreground">{stat.value}</span>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1 space-x-1 bg-muted/50 rounded-xl w-fit border border-border">
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'claims'
              ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <FileText size={16} />
          Claims ({claims.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'applications'
              ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <Shield size={16} />
          Applications ({applications.length})
        </button>
      </div>

      {/* Claims Content */}
      {activeTab === 'claims' && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-6 py-4">Claim ID</th>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={32} className="opacity-20" />
                        <p>No claims found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  claims.map((claim) => (
                    <tr key={claim.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-primary">{claim.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{claim.userName}</p>
                          <p className="text-xs text-muted-foreground">{claim.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{claim.claimType}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{claim.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(claim.status)}`}>
                          {claim.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(claim.submittedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openStatusModal(claim)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors"
                        >
                          <Edit size={14} />
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Applications Content */}
      {activeTab === 'applications' && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-6 py-4">App ID</th>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Policy Type</th>
                  <th className="px-6 py-4">Coverage</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Shield size={32} className="opacity-20" />
                        <p>No applications found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-purple-600 dark:text-purple-400">{app.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{app.fullName}</p>
                          <p className="text-xs text-muted-foreground">{app.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{app.insuranceType}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{app.coverageAmount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                          {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(app.submittedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {app.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onApproveApplication(app.id)}
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => {}} // Hook up rejection logic
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedClaim && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-border bg-muted/30">
              <h3 className="text-lg font-bold text-foreground">Update Claim Status</h3>
              <p className="text-sm text-muted-foreground">Modify status and add reviewer notes.</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary Card */}
              <div className="bg-muted/50 rounded-xl p-4 border border-border text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claim ID:</span>
                  <span className="font-mono font-medium">{selectedClaim.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applicant:</span>
                  <span className="font-medium">{selectedClaim.userName}</span>
                </div>
                <div className="flex justify-between border-t border-border/50 pt-2">
                  <span className="text-muted-foreground">Current Amount:</span>
                  <span className="font-bold text-foreground">{selectedClaim.amount}</span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Decision Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-background border border-input px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  >
                    <option value="pending">⏳ Pending Review</option>
                    <option value="APPROVED">✅ Approve Claim</option>
                    <option value="REJECTED">❌ Reject Claim</option>
                    <option value="MANUAL_REVIEW">⚠️ Needs Manual Review</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Reviewer Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter reason for decision..."
                    rows={4}
                    className="w-full bg-background border border-input px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedClaim(null);
                }}
                className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={18} />
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
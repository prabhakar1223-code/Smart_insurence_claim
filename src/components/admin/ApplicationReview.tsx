import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, FileText, Calendar, DollarSign, Briefcase, AlertCircle } from 'lucide-react';
import { ApplicationData } from '../user/ApplicationStatus';

interface ApplicationReviewProps {
  applications: ApplicationData[];
  onApprove: (applicationId: string) => void;
  onReject: (applicationId: string, reason: string, requiredInfo: string[]) => void;
}

export function ApplicationReview({ applications, onApprove, onReject }: ApplicationReviewProps) {
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requiredInfo, setRequiredInfo] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const reviewedApplications = applications.filter(app => app.status !== 'pending');

  const handleApprove = (appId: string) => {
    if (confirm('Are you sure you want to approve this application?')) {
      onApprove(appId);
      setSelectedApp(null);
    }
  };

  const handleRejectClick = (app: ApplicationData) => {
    setSelectedApp(app);
    setShowRejectModal(true);
    setRejectionReason('');
    setRequiredInfo([]);
    setNewRequirement('');
  };

  const handleRejectSubmit = () => {
    if (selectedApp && rejectionReason.trim()) {
      onReject(selectedApp.id, rejectionReason, requiredInfo);
      setShowRejectModal(false);
      setSelectedApp(null);
      setRejectionReason('');
      setRequiredInfo([]);
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequiredInfo([...requiredInfo, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setRequiredInfo(requiredInfo.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success/20 text-success';
      case 'rejected':
        return 'bg-destructive/20 text-destructive';
      case 'pending':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1>Insurance Application Review</h1>
        <p className="text-muted-foreground mt-1">Review and manage insurance applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-warning" size={24} />
            <span className="text-2xl font-semibold">{pendingApplications.length}</span>
          </div>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-success" size={24} />
            <span className="text-2xl font-semibold">
              {applications.filter(a => a.status === 'approved').length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Approved</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="text-destructive" size={24} />
            <span className="text-2xl font-semibold">
              {applications.filter(a => a.status === 'rejected').length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Rejected</p>
        </div>
      </div>

      {/* Pending Applications */}
      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="p-6 border-b border-border">
          <h3>Pending Applications</h3>
          <p className="text-sm text-muted-foreground mt-1">Applications awaiting review</p>
        </div>
        <div className="divide-y divide-border">
          {pendingApplications.length === 0 ? (
            <div className="p-12 text-center">
              <Clock size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending applications</p>
            </div>
          ) : (
            pendingApplications.map((app) => (
              <div key={app.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-foreground font-mono">{app.id}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>
                        Pending Review
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User size={16} />
                        <span>{app.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail size={16} />
                        <span>{app.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText size={16} />
                        <span>{app.insuranceType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign size={16} />
                        <span>{app.coverageAmount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={16} />
                        <span>Submitted: {new Date(app.submittedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="flex items-center gap-2 bg-success/20 text-success border border-success/30 px-4 py-2 rounded-lg hover:bg-success/30 transition-all"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectClick(app)}
                    className="flex items-center gap-2 bg-destructive/20 text-destructive border border-destructive/30 px-4 py-2 rounded-lg hover:bg-destructive/30 transition-all"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reviewed Applications */}
      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="p-6 border-b border-border">
          <h3>Reviewed Applications</h3>
          <p className="text-sm text-muted-foreground mt-1">Previously reviewed applications</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Applicant</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviewedApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No reviewed applications yet
                  </td>
                </tr>
              ) : (
                reviewedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-primary">{app.id}</span>
                    </td>
                    <td className="px-6 py-4">{app.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{app.insuranceType}</td>
                    <td className="px-6 py-4 font-semibold">{app.coverageAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {new Date(app.submittedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full shadow-card-elevated">
            <div className="p-6 border-b border-border">
              <h3 className="text-foreground">Reject Application</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Provide a reason for rejection and specify required information
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium mb-2">Application: {selectedApp.id}</p>
                  <p className="text-sm text-muted-foreground">Applicant: {selectedApp.fullName}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection Reason *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this application is being rejected..."
                    rows={4}
                    className="w-full bg-input-background border border-input px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Required Information for Approval</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Specify what information the applicant needs to provide for approval
                </p>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                    placeholder="e.g., Valid proof of income"
                    className="flex-1 bg-input-background border border-input px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                  >
                    Add
                  </button>
                </div>

                {requiredInfo.length > 0 && (
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Required Items:</p>
                    <ul className="space-y-2">
                      {requiredInfo.map((info, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <AlertCircle size={14} className="text-destructive" />
                            {info}
                          </span>
                          <button
                            onClick={() => removeRequirement(index)}
                            className="text-destructive hover:underline text-xs"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedApp(null);
                }}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
                className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle size={18} />
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

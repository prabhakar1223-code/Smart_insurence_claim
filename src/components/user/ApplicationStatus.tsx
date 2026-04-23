import React from 'react';
import { Clock, CheckCircle, XCircle, FileText, AlertCircle, Calendar, User, LogOut } from 'lucide-react';

export interface ApplicationData {
  id: string;
  fullName: string;
  email: string;
  insuranceType: string;
  coverageAmount: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedDate?: string;
  rejectionReason?: string;
  requiredInformation?: string[];
}

interface ApplicationStatusProps {
  applications: ApplicationData[];
  onViewDetails: (applicationId: string) => void;
  onLogout?: () => void;
}

export function ApplicationStatus({ applications, onViewDetails, onLogout }: ApplicationStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-success" size={24} />;
      case 'rejected':
        return <XCircle className="text-destructive" size={24} />;
      case 'pending':
        return <Clock className="text-warning" size={24} />;
      default:
        return <FileText className="text-muted-foreground" size={24} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success/20 text-success border-success/30';
      case 'rejected':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Under Review';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Application Status</h1>
          <p className="text-muted-foreground">Track the status of your insurance applications</p>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-card">
          <div className="bg-muted/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FileText size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-foreground mb-2">No Applications Yet</h3>
          <p className="text-muted-foreground">You haven't submitted any insurance applications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-card border border-border rounded-xl shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      {getStatusIcon(application.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-foreground">{application.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>{application.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText size={14} />
                          <span>{application.insuranceType} - {application.coverageAmount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Submitted: {new Date(application.submittedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewDetails(application.id)}
                    className="text-primary hover:underline text-sm"
                  >
                    View Details
                  </button>
                </div>

                {/* Rejection Information */}
                {application.status === 'rejected' && application.rejectionReason && (
                  <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
                      <div className="flex-1">
                        <h4 className="text-destructive font-medium mb-2">Application Rejected</h4>
                        <p className="text-sm text-destructive/90 mb-3">{application.rejectionReason}</p>
                        
                        {application.requiredInformation && application.requiredInformation.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-destructive mb-2">Required Information for Approval:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-destructive/90">
                              {application.requiredInformation.map((info, index) => (
                                <li key={index}>{info}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Approval Information */}
                {application.status === 'approved' && (
                  <div className="mt-4 bg-success/10 border border-success/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-success flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-success font-medium mb-1">Application Approved</h4>
                        <p className="text-sm text-success/90">
                          Your insurance application has been approved. You will receive your policy documents via email shortly.
                        </p>
                        {application.reviewedDate && (
                          <p className="text-sm text-success/80 mt-2">
                            Reviewed on: {new Date(application.reviewedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Information */}
                {application.status === 'pending' && (
                  <div className="mt-4 bg-warning/10 border border-warning/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="text-warning flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-warning font-medium mb-1">Under Review</h4>
                        <p className="text-sm text-warning/90">
                          Your application is currently being reviewed by our team. We'll notify you once a decision is made.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

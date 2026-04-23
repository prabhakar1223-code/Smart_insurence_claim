import React from 'react';
import { ArrowLeft, CheckCircle, Clock, FileText, Shield, IndianRupee, AlertCircle, Download, MessageSquare, XCircle } from 'lucide-react';

interface ClaimStatusProps {
  claimId: string;
  onBack: () => void;
  validationData?: {
    status: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
    issues?: string[];
    extractedData?: any;
    claimType?: string;
    amount?: string;
    submittedDate?: string;
  };
}

export function ClaimStatus({ claimId, onBack, validationData }: ClaimStatusProps) {
  const getStatusDisplay = () => {
    if (!validationData) return { text: 'Under Review', color: 'warning' };
    
    switch (validationData.status) {
      case 'APPROVED':
        return { text: 'Approved', color: 'success' };
      case 'REJECTED':
        return { text: 'Rejected', color: 'destructive' };
      case 'MANUAL_REVIEW':
        return { text: 'Manual Review Required', color: 'warning' };
      default:
        return { text: 'Under Review', color: 'warning' };
    }
  };

  const statusDisplay = getStatusDisplay();

  const claimData = {
    id: claimId,
    type: validationData?.claimType || 'Auto Insurance',
    status: statusDisplay.text,
    statusColor: statusDisplay.color,
    // MODIFIED: Changed fallback to ₹
    amount: validationData?.amount || '₹5,250',
    submittedDate: validationData?.submittedDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    estimatedResponse: validationData?.status === 'APPROVED' ? 'Payment processing' : validationData?.status === 'REJECTED' ? 'Claim closed' : '2-3 business days',
    description: `Claim for ${validationData?.claimType || 'insurance'} processed via OCR validation`,
    documents: [
      { name: 'uploaded-document.pdf', size: '2.4 MB', uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    ],
  };

  const getTimeline = () => {
    const baseTimeline = [
      {
        status: 'Claim Submitted',
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
        description: 'Your claim has been successfully submitted and assigned to a reviewer',
        completed: true,
        active: false,
        icon: FileText,
      },
      {
        status: 'Documents Verified',
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
        description: 'All uploaded documents have been verified and processed',
        completed: true,
        active: false,
        icon: CheckCircle,
      },
    ];

    if (validationData?.status === 'APPROVED') {
      return [
        ...baseTimeline,
        {
          status: 'Claim Approved',
          date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
          description: 'Your claim has been approved and validated',
          completed: true,
          active: false,
          icon: CheckCircle,
        },
        {
          status: 'Payment Processing',
          date: 'In Progress',
          description: 'Payment will be processed within 24-48 hours',
          completed: false,
          active: true,
          // MODIFIED: Changed DollarSign to IndianRupee
          icon: IndianRupee,
        },
      ];
    } else if (validationData?.status === 'REJECTED') {
      return [
        ...baseTimeline,
        {
          status: 'Claim Rejected',
          date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
          description: validationData.issues?.join(', ') || 'Claim did not meet validation criteria',
          completed: true,
          active: false,
          icon: XCircle,
        },
      ];
    } else {
      return [
        ...baseTimeline,
        {
          status: 'Manual Review Required',
          date: 'In Progress',
          description: validationData?.issues?.join(', ') || 'Our claims specialist is reviewing your case and documents',
          completed: false,
          active: true,
          icon: Shield,
        },
        {
          status: 'Final Decision',
          date: 'Pending',
          description: 'You will be notified once the review is complete',
          completed: false,
          active: false,
          // MODIFIED: Changed DollarSign to IndianRupee
          icon: IndianRupee,
        },
      ];
    }
  };

  const timeline = getTimeline();

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'warning': return 'bg-warning/20 text-warning';
      case 'success': return 'bg-success/20 text-success';
      case 'destructive': return 'bg-destructive/20 text-destructive';
      case 'primary': return 'bg-primary/20 text-primary';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-foreground mb-4">Claim Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Claim Type</span>
                  <span className="text-foreground">{claimData.type}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Claim Amount</span>
                  <span className="text-foreground font-medium">{claimData.amount}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="text-muted-foreground">Submitted Date</span>
                  <span className="text-foreground">{claimData.submittedDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated Response</span>
                  <span className="text-foreground">{claimData.estimatedResponse}</span>
                </div>
              </div>
            </div>

            {/* Extracted Data from OCR */}
            {validationData?.extractedData && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-foreground mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  Extracted Document Data
                </h3>
                <div className="space-y-3">
                  {Object.entries(validationData.extractedData)
                    .filter(([key]) => !key.startsWith('_') && key !== 'extractedText')
                    .map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between pb-3 border-b border-border last:border-0 last:pb-0">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-foreground text-right max-w-[60%]">
                          {value ? String(value) : 'Not detected'}
                        </span>
                      </div>
                    ))
                  }
                </div>
                {validationData.extractedData._fallbackApplied && (
                  <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm text-warning flex items-center gap-2">
                      <AlertCircle size={16} />
                      Some values used fallback defaults due to OCR detection limitations
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Validation Issues */}
            {validationData?.issues && validationData.issues.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
                <h3 className="text-destructive mb-4 flex items-center gap-2">
                  <AlertCircle size={20} />
                  Validation Issues
                </h3>
                <ul className="space-y-2">
                  {validationData.issues.map((issue, idx) => (
                    <li key={idx} className="text-destructive flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="text-left sm:text-right">
            <h3 className="text-foreground">{claimData.amount}</h3>
            <p className="text-sm text-muted-foreground mt-1">Claim Amount</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Submitted</p>
            <p className="text-foreground">{claimData.submittedDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Expected Response</p>
            <p className="text-foreground">{claimData.estimatedResponse}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Timeline */}
        <div className="lg:col-span-2">
          <h2 className="text-foreground mb-6">Claim Timeline</h2>

          <div className="space-y-6">
            {timeline.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="relative">
                  {/* Connector Line */}
                  {index < timeline.length - 1 && (
                    <div
                      className={`absolute left-5 top-12 w-0.5 h-full ${
                        item.completed ? 'bg-success' : 'bg-border'
                      }`}
                    ></div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                        item.completed && item.status === 'Claim Rejected'
                          ? 'bg-destructive/20 border-2 border-destructive'
                          : item.completed
                          ? 'bg-success/20 border-2 border-success'
                          : item.active
                          ? 'bg-warning/20 border-2 border-warning animate-pulse'
                          : 'bg-muted border-2 border-border'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                          item.completed && item.status === 'Claim Rejected'
                            ? 'text-destructive'
                            : item.completed
                            ? 'text-success'
                            : item.active
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        }
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-card border border-border rounded-xl p-4 shadow-card">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="text-foreground">{item.status}</h4>
                        {item.completed && item.status === 'Claim Rejected' && (
                          <XCircle size={18} className="text-destructive shrink-0" />
                        )}
                        {item.completed && item.status !== 'Claim Rejected' && (
                          <CheckCircle size={18} className="text-success shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.date}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Claim Details */}
          <div>
            <h3 className="text-foreground mb-4">Claim Details</h3>
            <div className="bg-card border border-border rounded-xl p-4 shadow-card">
              {validationData?.extractedData ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-2">Extracted Information:</p>
                  {Object.entries(validationData.extractedData).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-sm text-foreground text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-foreground">{claimData.description}</p>
                </>
              )}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-foreground mb-4">Documents</h3>
            <div className="space-y-2">
              {claimData.documents.map((doc, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <FileText size={20} className="text-primary shrink-0 mt-0.5" />
                      <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-foreground mb-4">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {claimData.description}
                        </p>
                        {validationData?.extractedData?.extractedText && (
                          <details className="mt-4">
                            <summary className="text-sm text-primary cursor-pointer hover:underline">View extracted text from document</summary>
                            <pre className="mt-3 p-3 bg-muted rounded-lg text-xs text-foreground overflow-x-auto">
                              {validationData.extractedData.extractedText}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    <button className="text-primary hover:text-primary/80 transition-colors shrink-0">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <MessageSquare size={18} />
              Contact Support
            </button>
            <button className="w-full bg-card border border-border text-foreground px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2">
              <FileText size={18} />
              Add Documents
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground mb-2">Stay Updated</p>
                <p className="text-sm text-muted-foreground">
                  You'll receive email and SMS notifications when your claim status changes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
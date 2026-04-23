import React, { useState } from 'react';
import {
  X, User, FileText, IndianRupee, Shield, Calendar, Eye,
  CheckCircle, XCircle, ShieldAlert, AlertTriangle, ShieldCheck,
  Loader2, ShieldOff, MessageSquare, MapPin, Stethoscope, BarChart, Info
} from 'lucide-react';

interface Props {
  claim: any;
  onClose: () => void;
  onUpdateStatus?: (claimId: string, status: string, notes?: string, markedAsFraud?: boolean) => Promise<void>;
}

export function ClaimInvestigation({ claim, onClose, onUpdateStatus }: Props) {
  const [adminNotes, setAdminNotes] = useState(claim?.adminNotes || '');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState(false);

  if (!claim) return null;

  const score = claim.fraudScore || claim.riskScore || 0;
  const isFinalized = ['APPROVED', 'REJECTED', 'BLOCKED'].includes((claim.status || '').toUpperCase());

  const getRiskColor = (s: number) => {
    if (s >= 70) return { color: '#ef4444', label: 'High Risk', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20' };
    if (s >= 30) return { color: '#f59e0b', label: 'Medium Risk', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20' };
    return { color: '#10b981', label: 'Low Risk', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' };
  };

  // Helper function to provide detailed explanations for risk factors
  const getRiskExplanation = (reason: string, score: number): string => {
    const reasonLower = reason.toLowerCase();
    if (reasonLower.includes('amount') || reasonLower.includes('value')) {
      return 'Claim amount appears unusually high compared to similar claims or policy limits.';
    } else if (reasonLower.includes('pattern') || reasonLower.includes('frequency')) {
      return 'User has submitted multiple claims in a short timeframe, which is statistically unusual.';
    } else if (reasonLower.includes('document') || reasonLower.includes('evidence')) {
      return 'Uploaded documents show inconsistencies, poor quality, or potential tampering.';
    } else if (reasonLower.includes('location') || reasonLower.includes('geographic')) {
      return 'Claim location differs from policyholder\'s registered address or shows suspicious patterns.';
    } else if (reasonLower.includes('time') || reasonLower.includes('date')) {
      return 'Timing of claim submission raises concerns (e.g., immediately after policy purchase).';
    } else if (reasonLower.includes('ocr') || reasonLower.includes('extracted')) {
      return 'OCR analysis detected mismatches between extracted data and submitted information.';
    } else if (reasonLower.includes('damage') || reasonLower.includes('injury')) {
      return 'Reported damage/injury severity appears inconsistent with evidence or circumstances.';
    } else {
      return 'AI detected anomalous patterns that deviate from normal claim behavior.';
    }
  };

  // Helper function to determine severity level for a risk factor
  const getRiskSeverity = (reason: string): string => {
    const reasonLower = reason.toLowerCase();
    if (reasonLower.includes('high') || reasonLower.includes('critical') || reasonLower.includes('severe')) {
      return 'HIGH';
    } else if (reasonLower.includes('medium') || reasonLower.includes('moderate')) {
      return 'MEDIUM';
    } else if (reasonLower.includes('low') || reasonLower.includes('minor')) {
      return 'LOW';
    } else {
      // Default based on overall score
      return score >= 70 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';
    }
  };

  const risk = getRiskColor(score);

  const handleAction = async (status: string, markedAsFraud?: boolean) => {
    if (!onUpdateStatus) return;
    setActionLoading(status);
    await onUpdateStatus(claim.id || claim.claimId, status, adminNotes || undefined, markedAsFraud);
    setActionLoading(null);
    setActionDone(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-4xl rounded-2xl border border-border shadow-2xl my-4 sm:my-8 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">

        {/* Header - Sticky */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${risk.bg} border ${risk.border}`}>
              {score >= 70 ? <ShieldAlert className={risk.text} size={20} /> :
                score >= 30 ? <AlertTriangle className={risk.text} size={20} /> :
                  <ShieldCheck className={risk.text} size={20} />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Claim Investigation</h2>
              <p className="text-xs text-muted-foreground font-mono">{claim.id || claim.claimId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* Action Done Banner */}
          {actionDone && (
            <div className="bg-emerald-500/15 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle size={16} /> Status updated successfully.
            </div>
          )}

          {/* Section A: Claim Information */}
          <div className="bg-muted/20 border border-border rounded-xl p-4 sm:p-5">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><FileText size={16} className="text-primary" /> Claim Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Claim ID</p>
                <p className="font-mono font-medium text-primary text-xs">{claim.id || claim.claimId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">User</p>
                <p className="font-medium flex items-center gap-1"><User size={12} /> {claim.userName || claim.user || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="text-xs truncate">{claim.userEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Type</p>
                <p className="font-medium capitalize">{claim.claimType || claim.insuranceType || claim.type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
                <p className="font-bold flex items-center gap-0.5"><IndianRupee size={13} />{Number(claim.amount || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Submitted</p>
                <p className="flex items-center gap-1 text-xs"><Calendar size={12} /> {claim.submittedDate ? new Date(claim.submittedDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              {(claim.repairDetails || claim.hospitalName || claim.location) && (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Location / Entity</p>
                  <p className="flex items-center gap-1 text-sm"><MapPin size={12} /> {claim.repairDetails || claim.hospitalName || claim.location}</p>
                </div>
              )}
              {claim.doctorName && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Doctor</p>
                  <p className="flex items-center gap-1 text-sm"><Stethoscope size={12} /> {claim.doctorName}</p>
                </div>
              )}
            </div>
            {claim.description && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground/80">{claim.description}</p>
              </div>
            )}
          </div>

          {/* Section B: Document Preview - Enhanced */}
          <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/20 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-200/30 dark:border-blue-800/30 rounded-xl p-4 sm:p-5">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" />
              <span className="text-blue-700 dark:text-blue-300">Uploaded Evidence & Documents</span>
            </h3>

            {claim.documentUrl || claim.documents ? (
              <div className="space-y-4">
                {/* Main Evidence Image */}
                {claim.documentUrl && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">Primary Evidence</p>
                    <div className="relative group">
                      <img
                        src={claim.documentUrl}
                        alt="evidence"
                        className="w-full max-h-64 object-contain border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
                      />
                      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => window.open(claim.documentUrl, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2"
                        >
                          <Eye size={14} /> View Full Size
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Documents List */}
                <div>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">Supporting Documents</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {claim.documents && claim.documents.length > 0 ? (
                      claim.documents.map((doc: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-lg p-3 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                            <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name || `Document ${index + 1}`}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{doc.size || 'Unknown size'}</p>
                          </div>
                          <button
                            onClick={() => doc.url && window.open(doc.url, '_blank')}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium"
                          >
                            View
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30 rounded-lg p-4 text-center">
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">No additional documents</p>
                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Only primary evidence is available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30 rounded-lg p-6 text-center">
                <FileText size={32} className="mx-auto mb-3 text-blue-400/70" />
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">No documents uploaded</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">This claim was submitted without supporting evidence</p>
              </div>
            )}
          </div>

          {/* Section C: OCR Extracted Data */}
          <div className="bg-muted/20 border border-border rounded-xl p-4 sm:p-5">
            <h3 className="font-semibold text-sm mb-3">📊 OCR Extracted Data</h3>
            {claim.extractedData ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {claim.extractedData.amount != null && (
                  <div className="bg-background border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Extracted Amount</p>
                    <p className="font-bold">₹{Number(claim.extractedData.amount).toLocaleString('en-IN')}</p>
                  </div>
                )}
                {claim.extractedData.policyNumber && (
                  <div className="bg-background border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Policy Number</p>
                    <p className="font-mono text-sm">{claim.extractedData.policyNumber}</p>
                  </div>
                )}
                {claim.extractedData.extractedText && (
                  <div className="col-span-2 bg-background border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Extracted Text</p>
                    <p className="text-xs text-foreground/70 whitespace-pre-wrap">{claim.extractedData.extractedText}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs py-4 text-center">No OCR data available.</p>
            )}
          </div>

          {/* Section D: AI Analysis + Risk Score - Enhanced */}
          <div className={`border-2 rounded-xl p-4 sm:p-5 ${risk.bg} ${risk.border}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield size={22} className={risk.text} />
                <h3 className="font-semibold text-lg">
                  <span className={risk.text}>AI Fraud Analysis & Reasoning</span>
                </h3>
              </div>
              <div className={`px-3 py-1 rounded-full ${risk.bg} ${risk.border}`}>
                <p className={`text-xs font-bold ${risk.text}`}>Confidence: {score >= 70 ? 'High' : score >= 30 ? 'Medium' : 'Low'}</p>
              </div>
            </div>

            {/* AI Summary */}
            <div className="mb-6 p-3 bg-white/5 dark:bg-black/10 rounded-lg border border-white/10 dark:border-black/20">
              <p className="text-sm font-medium mb-1">AI Assessment Summary</p>
              <p className="text-xs text-foreground/80">
                {score >= 70
                  ? 'Our AI system has detected multiple high-risk indicators suggesting potential fraudulent activity. This claim exhibits patterns consistent with known fraud cases.'
                  : score >= 30
                    ? 'The AI has identified some concerning patterns that warrant further review. While not definitively fraudulent, several risk factors require human verification.'
                    : 'AI analysis indicates this claim follows normal patterns with minimal risk indicators. No significant fraud patterns detected.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Risk Score Visualization */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 dark:bg-black/20 rounded-2xl p-5 text-center">
                  <p className="text-sm font-medium mb-2">Overall Risk Score</p>
                  <div className="relative w-48 h-48 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-300 dark:text-gray-700" />
                      <circle
                        cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="10"
                        strokeDasharray="502.4"
                        strokeDashoffset={502.4 - (502.4 * score / 100)}
                        className={score >= 70 ? 'text-red-500' : score >= 30 ? 'text-amber-500' : 'text-emerald-500'}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <span className={`text-4xl font-black ${risk.text} leading-none`}>{score}</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Risk Score</span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full ${risk.bg} ${risk.border} inline-block`}>
                    <p className={`text-sm font-bold ${risk.text}`}>{risk.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {score >= 70
                      ? 'High risk - Requires manual investigation'
                      : score >= 30
                        ? 'Medium risk - Review recommended'
                        : 'Low risk - Likely genuine claim'}
                  </p>
                </div>
              </div>

              {/* Middle: Risk Factors Breakdown */}
              <div className="lg:col-span-2">
                <div className="mb-5">
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <BarChart size={16} className={risk.text} /> Risk Factor Breakdown
                  </h4>
                  {(claim.fraudFlags || claim.flags || []).length > 0 ? (
                    <div className="space-y-3">
                      {(claim.fraudFlags || claim.flags || []).map((reason: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-white/5 dark:bg-black/10 rounded-xl border border-white/10 dark:border-black/20">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${risk.bg}`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{reason}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getRiskExplanation(reason, score)}
                            </p>
                          </div>
                          <div className={`px-2 py-1 text-xs font-bold rounded ${risk.bg} ${risk.text}`}>
                            {getRiskSeverity(reason)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                      <CheckCircle size={24} className="mx-auto mb-2 text-emerald-400" />
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">No suspicious patterns detected</p>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">AI analysis found no fraud indicators</p>
                    </div>
                  )}
                </div>

                {/* Risk Level Explanation */}
                <div className="bg-white/5 dark:bg-black/10 rounded-xl p-4 border border-white/10 dark:border-black/20">
                  <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Info size={16} className={risk.text} /> What This Score Means
                  </h4>
                  <p className="text-xs text-foreground/80 mb-3">
                    {score >= 70
                      ? 'Claims with scores ≥ 70 indicate high probability of fraud based on multiple risk factors. Common indicators include unusual claim patterns, mismatched documentation, or suspicious user behavior.'
                      : score >= 30
                        ? 'Scores between 30-69 suggest potential issues requiring review. These may include minor inconsistencies, first-time claims, or borderline documentation.'
                        : 'Scores below 30 indicate low-risk claims that typically follow normal patterns and have consistent documentation.'}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span>0-29: Low Risk</span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 ml-3"></span>
                    <span>30-69: Medium Risk</span>
                    <span className="w-3 h-3 rounded-full bg-red-500 ml-3"></span>
                    <span>70-100: High Risk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Risk Indicators */}
            {(claim.breakdown || claim.carDamage?.percentage) && (
              <div className="mt-5 pt-5 border-t border-border/30">
                <h4 className="text-sm font-bold mb-3">Additional Risk Indicators</h4>
                <div className="grid grid-cols-2 gap-4">
                  {claim.breakdown && claim.breakdown.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-2">Score Breakdown:</p>
                      <div className="flex flex-wrap gap-2">
                        {claim.breakdown.slice(0, 5).map((item: any, idx: number) => (
                          <div key={idx} className="px-3 py-1.5 bg-white/10 dark:bg-black/20 rounded-lg border border-white/10 dark:border-black/20">
                            <p className="text-xs font-medium">{item.factor}</p>
                            <p className={`text-xs font-bold ${item.score > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {item.score > 0 ? `+${item.score}` : item.score}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {claim.carDamage?.percentage && (
                    <div>
                      <p className="text-xs text-muted-foreground">Damage Assessment</p>
                      <p className="text-lg font-bold">{claim.carDamage.percentage}% damage</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section E: Admin Notes */}
          <div className="bg-muted/20 border border-border rounded-xl p-4 sm:p-5">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><MessageSquare size={16} /> Internal Notes</h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add investigation notes (visible only to admin)..."
              rows={3}
              className="w-full bg-background border border-input px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
              disabled={actionDone}
            />
          </div>

          {/* Admin Action Buttons */}
          {!isFinalized && !actionDone && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <button
                onClick={() => handleAction('APPROVED')}
                disabled={!!actionLoading}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === 'APPROVED' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Approve
              </button>
              <button
                onClick={() => handleAction('REJECTED')}
                disabled={!!actionLoading}
                className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === 'REJECTED' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Reject
              </button>
              <button
                onClick={() => handleAction('BLOCKED', true)}
                disabled={!!actionLoading}
                className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === 'BLOCKED' ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
                Mark Fraud
              </button>
              <button
                onClick={() => {
                  if (onUpdateStatus && adminNotes) {
                    onUpdateStatus(claim.id || claim.claimId, claim.status || 'MANUAL_REVIEW', adminNotes);
                  }
                }}
                disabled={!adminNotes.trim()}
                className="flex items-center justify-center gap-1.5 bg-secondary hover:bg-accent text-secondary-foreground px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium border border-border transition-colors disabled:opacity-30"
              >
                <MessageSquare size={14} />
                Save Notes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
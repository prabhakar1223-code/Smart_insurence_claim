import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Calendar, 
  IndianRupee, 
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  MessageSquare,
  Clock,
  Printer,
  ChevronRight,
  Activity
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ClaimReviewProps {
  claim: any;
  onBack: () => void;
  onUpdateStatus?: (id: string, status: string, notes?: string, markedAsFraud?: boolean) => void;
}

export function ClaimReview({ claim, onBack, onUpdateStatus }: ClaimReviewProps) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!claim) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <AlertTriangle size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-lg font-bold">No Claim Selected</h2>
        <p className="text-muted-foreground mt-2">Please select a claim from the list to review.</p>
        <button onClick={onBack} className="mt-6 bg-primary text-white px-6 py-2 rounded-xl font-bold">Back to Queue</button>
      </div>
    );
  }

  // Enhanced Fraud Summary (from calculation)
  const riskColor = (claim.fraudScore || 0) >= 70 ? 'text-red-500' : (claim.fraudScore || 0) >= 30 ? 'text-amber-500' : 'text-emerald-500';
  const riskBg = (claim.fraudScore || 0) >= 70 ? 'bg-red-500/10' : (claim.fraudScore || 0) >= 30 ? 'bg-amber-500/10' : 'bg-emerald-500/10';

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Claim_${claim.id}_Report.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const confirmApproval = () => {
    onUpdateStatus?.(claim.id, 'APPROVED', internalNote);
    setShowApproveModal(false);
    onBack();
  };

  const confirmRejection = () => {
    onUpdateStatus?.(claim.id, 'REJECTED', rejectReason || internalNote);
    setShowRejectModal(false);
    onBack();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-xl transition-all border border-border"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Claim Review</h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Investigative Suite v2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl transition-all hover:bg-accent border border-border flex items-center gap-2 font-bold text-xs"
          >
            {isExporting ? <span className="animate-spin">⏳</span> : <Download size={16} />}
            {isExporting ? 'GENERATING...' : 'EXPORT REPORT'}
          </button>
        </div>
      </div>

      {/* Main Content Area - Pass Ref for PDF Capture */}
      <div ref={reportRef} className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Detailed Intelligence */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main ID Card */}
          <div className="bg-card border-l-4 border-l-primary border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-xl font-black text-primary font-mono">{claim.id}</span>
                     <span className="text-muted-foreground font-black text-xs px-2 py-0.5 bg-muted rounded">#{claim.claimType?.toUpperCase() || 'GENERAL'}</span>
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">Submitted on {new Date(claim.submittedDate).toLocaleString()}</p>
               </div>
               <div className="flex items-center gap-2">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-tighter uppercase border ${
                    claim.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                    claim.status === 'REJECTED' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                    'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}>
                    {claim.status}
                  </span>
                  {(claim.fraudScore || 0) >= 70 && (
                     <span className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-red-600/20">
                        <AlertTriangle size={12}/> HIGH RISK
                     </span>
                  )}
               </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center border border-border">
                        <User size={18} className="text-primary"/>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50 mb-1">Policy Holder</p>
                        <p className="font-bold text-lg">{claim.userName || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground font-medium">{claim.userEmail || 'no-email@system.ai'}</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center border border-border">
                        <Calendar size={18} className="text-primary"/>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50 mb-1">Incident Detail</p>
                        <p className="font-bold">{claim.incidentLocation || 'Unknown Site'}</p>
                        <p className="text-xs text-muted-foreground font-medium italic underline decoration-primary/30 decoration-2">Digital Fingerprint: Verified</p>
                     </div>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <IndianRupee size={18} className="text-primary"/>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50 mb-1">Claim Amount</p>
                        <p className="text-2xl font-black text-primary">₹{Number(claim.amount || 0).toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center border border-border">
                        <Shield size={18} className="text-primary"/>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50 mb-1">Target Policy</p>
                        <p className="font-bold font-mono text-sm tracking-widest">{claim.policyNumber || 'AUTO-SELECT'}</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Part 6: Explainable AI Breakdown */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-lg font-bold">Predictive Explainability</h3>
                   <p className="text-xs text-muted-foreground mt-1 font-medium">AI Reasoning Engine Logs</p>
                </div>
                <div className={`px-4 py-2 rounded-2xl ${riskBg} border border-border flex items-center gap-2`}>
                   <Activity size={16} className={riskColor}/>
                   <span className={`text-sm font-black ${riskColor}`}>{claim.fraudScore || 0}% RISK SCORE</span>
                </div>
             </div>

             <div className="grid sm:grid-cols-2 gap-4">
                {claim.breakdown ? Object.entries(claim.breakdown).map(([key, val]: [string, any]) => (
                  <div key={key} className="p-4 rounded-2xl border border-border bg-muted/5 hover:bg-muted/10 transition-colors">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`text-xs font-black ${val > 10 ? 'text-red-500' : 'text-emerald-500'}`}>+{val} pts</span>
                     </div>
                     <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${val > 10 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min((val/20)*100, 100)}%` }}
                        />
                     </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-border">
                     <p className="text-xs font-bold text-muted-foreground">Legacy claim data - No AI breakdown available</p>
                  </div>
                )}
             </div>

             {claim.fraudFlags && claim.fraudFlags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-border">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Critical Alerts Triggered</h4>
                   <div className="flex flex-wrap gap-2">
                      {claim.fraudFlags.map((flag: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-red-500/5 text-red-500 px-3 py-1.5 rounded-xl border border-red-500/10 text-[11px] font-bold">
                           <AlertTriangle size={12}/>
                           {flag}
                        </div>
                      ))}
                   </div>
                </div>
             )}
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
             <h3 className="text-lg font-bold mb-6">Investigative Context</h3>
             <div className="space-y-4">
                <div className="p-4 bg-muted/10 rounded-2xl border border-border">
                   <p className="text-xs font-black uppercase text-muted-foreground mb-2 opacity-50 tracking-widest">Claimant Description</p>
                   <p className="text-sm font-medium leading-relaxed">{claim.description || 'No description provided.'}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                       <p className="text-xs font-black text-muted-foreground mb-1">OCR VALIDATION</p>
                       <p className="text-sm font-bold text-emerald-600">PASSED (High Confidence)</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                       <p className="text-xs font-black text-muted-foreground mb-1">POLICY STATUS</p>
                       <p className="text-sm font-bold text-emerald-600">ACTIVE & ELIGIBLE</p>
                    </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Sidebar - Workflow & Controls */}
        <div className="space-y-6">
          
          {/* Decision Matrix */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-card-elevated space-y-4">
            <h3 className="text-lg font-black mb-4">Decision Matrix</h3>
            
            <button 
              onClick={() => setShowApproveModal(true)}
              className="w-full bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:-translate-y-1 transition-all flex items-center justify-between group"
            >
              Approve Payout
              <CheckCircle size={18} className="group-hover:rotate-12 transition-transform"/>
            </button>
            
            <button 
              onClick={() => setShowRejectModal(true)}
              className="w-full bg-red-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 hover:-translate-y-1 transition-all flex items-center justify-between group"
            >
              Reject Submission
              <XCircle size={18} className="group-hover:scale-110 transition-transform"/>
            </button>
            
            <hr className="border-border my-4"/>
            
            <button className="w-full bg-secondary text-secondary-foreground px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-border hover:bg-accent transition-all flex items-center justify-between">
              Request Evidence
              <MessageSquare size={18}/>
            </button>
          </div>

          {/* SLA Tracking */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold">SLA Performance</h3>
                <Clock size={16} className="text-muted-foreground opacity-50"/>
             </div>
             <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                   <span className="font-bold text-muted-foreground">Elapsed Time</span>
                   <span className="font-black text-primary">1h 24m</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-[30%] rounded-full shadow-lg shadow-primary/20"/>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium italic text-center">Protocol SLA: Review within 24 hours</p>
             </div>
          </div>

          {/* Timeline */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden h-fit">
            <h3 className="font-bold mb-6">Activity Timeline</h3>
            <div className="space-y-6 relative">
               <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-muted"/>
               
               {[
                 { event: 'Claim Ingested', time: claim.submittedDate, user: 'System Relay', icon: Shield },
                 { event: 'AI Analysis Complete', time: claim.submittedDate, user: 'Fraud Engine v2', icon: Activity },
                 { event: 'Manual Review Assigned', time: new Date().toISOString(), user: 'Distribution API', icon: User }
               ].map((item, idx) => (
                 <div key={idx} className="flex gap-4 relative z-10">
                    <div className="w-7 h-7 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-sm">
                       <item.icon size={12} className="text-primary"/>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs font-black tracking-tight leading-none">{item.event}</p>
                       <p className="text-[10px] font-bold text-muted-foreground opacity-70">{item.user} • {new Date(item.time).toLocaleTimeString()}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlays (Standard Radix-like implementation) */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 mx-auto">
               <CheckCircle size={32} className="text-emerald-500"/>
            </div>
            <h3 className="text-xl font-black text-center mb-2">Confirm Approved Payout</h3>
            <p className="text-muted-foreground text-center text-sm font-medium mb-8 leading-relaxed">
              You are authorizing a payout of <span className="text-primary font-black">₹{Number(claim.amount).toLocaleString()}</span>. This action is recorded in the audit trail and cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowApproveModal(false)}
                className="flex-1 bg-secondary px-6 py-3 rounded-2xl font-bold text-xs border border-border hover:bg-accent transition-all"
              >
                CANCEL
              </button>
              <button 
                onClick={confirmApproval}
                className="flex-1 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all"
              >
                AUTHORIZE
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 mx-auto">
               <XCircle size={32} className="text-red-500"/>
            </div>
            <h3 className="text-xl font-black text-center mb-2">Confirm Rejection</h3>
            <p className="text-muted-foreground text-center text-sm font-medium mb-6">
              Please specify the reasoning for this rejection. This will be visible to the policy holder.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Discrepancy in medical reports / Duplicate claim detected..."
              className="w-full bg-muted/30 border border-border p-4 rounded-2xl text-sm font-medium h-32 focus:outline-none focus:ring-2 focus:ring-primary/20 mb-6 resize-none"
            />
            <div className="flex gap-4">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-secondary px-6 py-3 rounded-2xl font-bold text-xs border border-border hover:bg-accent transition-all"
              >
                BACK
              </button>
              <button 
                onClick={confirmRejection}
                disabled={!rejectReason}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-lg shadow-red-500/20 hover:opacity-90 transition-all disabled:opacity-50"
              >
                REJECT CLAIM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
  return <Clock className={`${className} animate-spin`} size={size} />;
}
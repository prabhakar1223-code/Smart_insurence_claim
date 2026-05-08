const fs = require('fs');

let content = fs.readFileSync('src/components/admin/ClaimInvestigation.tsx', 'utf-8');

const newModalContent = `  // Create portal for modal to render at root level
  const cardStyle = { backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' };
  
  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '90%',
          maxWidth: '1100px',
          maxHeight: '90vh',
          borderRadius: '18px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0F172A',
          boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
          padding: '24px'
        }}
        className="relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div id="modalHeader" className="flex items-center justify-between pb-6 border-b border-[rgba(255,255,255,0.08)] mb-6">
          <div className="flex items-center gap-4">
            <div className={\`p-3 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30\`}>
              <ShieldAlert size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '30px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                Fraud Investigation Dashboard
              </h2>
              <p className="text-sm text-[#94A3B8] font-mono mt-1 flex items-center gap-3">
                <span className="font-bold">ID: {claim.id || claim.claimId}</span>
                <span className="text-gray-600">•</span>
                <span>Risk Level:</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-red-600">
                  {risk.label}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-full transition-all text-[#94A3B8] hover:text-white border border-[rgba(255,255,255,0.05)]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div 
          style={{ overflowY: 'auto', paddingRight: '8px' }}
          className="flex-1 space-y-6 scrollbar-custom scrollbar-custom-smooth"
        >
          {/* Back to dashboard text */}
          <div className="text-blue-400 font-medium text-sm flex items-center gap-2 mb-2 hover:text-blue-300 cursor-pointer" onClick={onClose}>
            &larr; Back to Dashboard
          </div>

          {actionDone && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-sm shadow-sm">
              <CheckCircle size={20} className="text-emerald-500" />
              <div>
                <p className="font-bold text-[#111827]">Status updated successfully.</p>
                <p className="text-xs text-[#374151]">Claim has been processed.</p>
              </div>
            </div>
          )}

          {/* Top Summary Row - 4 Cards */}
          <div style={cardStyle}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={24} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Claim Type</p>
                  <p className="font-bold text-[16px] text-[#111827] capitalize">{claim.claimType || claim.insuranceType || claim.type || 'Vehicle'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <IndianRupee size={24} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Claim Amount</p>
                  <p className="font-bold text-[16px] text-[#111827]">₹ {Number(claim.amount || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Calendar size={24} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Submitted Date</p>
                  <p className="font-bold text-[16px] text-[#111827]">{claim.submittedDate ? new Date(claim.submittedDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={24} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Expected Response</p>
                  <p className="font-bold text-[16px] text-[#111827]">2-3 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Fraud Analysis */}
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-6">
              <Zap size={20} className="text-blue-500" />
              <h3 className="text-[#111827] text-xl font-bold">AI Fraud Analysis & Reasoning</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Risk Score */}
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm font-bold text-[#374151] mb-6">Overall Risk Score</p>
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="80" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                    <circle cx="96" cy="96" r="80" fill="none" stroke={score >= 70 ? '#EF4444' : score >= 30 ? '#F59E0B' : '#10B981'} strokeWidth="12" strokeDasharray="502.4" strokeDashoffset={502.4 - (502.4 * score / 100)} className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-[#111827]">{score}</span>
                    <span className="text-sm text-[#6B7280]">/ 100</span>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <span className={\`px-4 py-1.5 rounded-full text-sm font-bold \${score >= 70 ? 'bg-red-100 text-red-600' : score >= 30 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}\`}>
                    {risk.label}
                  </span>
                  <p className="text-xs text-[#6B7280] mt-3">
                    {score >= 70 ? 'High risk - Requires manual investigation' : score >= 30 ? 'Medium risk - Review recommended' : 'Low risk - Auto-approval possible'}
                  </p>
                </div>
              </div>

              {/* Right: Breakdown & Explanations */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart size={18} className="text-[#374151]" />
                  <p className="font-bold text-[#374151]">Risk Factor Breakdown</p>
                </div>
                
                {claim.breakdown && claim.breakdown.length > 0 ? (
                  claim.breakdown.map((item: any, idx: number) => {
                    const reason = typeof item === 'string' ? item : item.reason || item.factor || 'Risk factor detected';
                    const severity = getRiskSeverity(reason);
                    return (
                      <div key={idx} className="bg-[#F9FAFB] rounded-xl p-4 flex gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-[#111827] text-sm mb-1">{reason}</p>
                          <p className="text-xs text-[#6B7280]">{getRiskExplanation(reason, score)}</p>
                        </div>
                        <div>
                          <span className={\`px-3 py-1 rounded-full text-xs font-bold \${severity === 'HIGH' ? 'bg-red-100 text-red-600' : severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}\`}>
                            {severity}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-[#F9FAFB] rounded-xl p-4 flex gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-[#111827] text-sm mb-1">Standard claim pattern</p>
                      <p className="text-xs text-[#6B7280]">No major anomalies detected during analysis.</p>
                    </div>
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">LOW</span>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 mt-4 flex gap-3">
                  <Info size={20} className="text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-blue-800 text-sm mb-1">What This Score Means</p>
                    <p className="text-xs text-blue-700 leading-relaxed mb-2">
                      Claims with scores ≥ 70 indicate high probability of fraud based on multiple risk factors. Common indicators include unusual claim patterns, mismatched documentation, or suspicious user behavior.
                    </p>
                    <div className="flex gap-4 text-xs font-medium">
                      <span className="text-green-600">0-29: Low Risk</span>
                      <span className="text-yellow-600">30-69: Medium Risk</span>
                      <span className="text-red-600">70-100: High Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Uploads and OCR */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={cardStyle}>
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-blue-500" />
                <h3 className="text-[#111827] font-bold">Uploaded Evidence & Documents</h3>
              </div>
              {claim.documentUrl ? (
                <div className="border border-[#E5E7EB] rounded-xl p-2 relative group cursor-pointer" onClick={() => window.open(claim.documentUrl, '_blank')}>
                  <img src={claim.documentUrl} alt="evidence" className="w-full h-48 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <button className="bg-white text-[#111827] px-4 py-2 rounded-lg text-sm font-bold shadow-lg">View Full Image</button>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[#D1D5DB] rounded-xl p-8 text-center bg-[#F9FAFB]">
                  <FileText size={48} className="mx-auto text-[#9CA3AF] mb-4" />
                  <p className="font-bold text-[#111827] mb-1 text-lg">No documents uploaded</p>
                  <p className="text-sm text-[#6B7280]">This claim was submitted without supporting evidence</p>
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileSearch size={18} className="text-green-500" />
                  <h3 className="text-[#111827] font-bold">OCR Extracted Data & Analysis</h3>
                </div>
                <button onClick={() => setShowOcrDetails(!showOcrDetails)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 border border-blue-200">
                  {showOcrDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              {claim.extractedData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
                      <p className="text-xs text-[#6B7280] mb-1">Extracted Amount</p>
                      <p className="font-bold text-[#111827] text-lg">₹{claim.extractedData.amount || 0}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
                      <p className="text-xs text-[#6B7280] mb-1">Confidence Score</p>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#111827] text-lg">{Math.round(claim.extractedData.ocrConfidence || 0)}%</p>
                        <span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase \${getOCRConfidenceColor(claim.extractedData.ocrConfidence || 0)}\`}>
                          {getOCRConfidenceLabel(claim.extractedData.ocrConfidence || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {showOcrDetails && (
                     <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 text-sm text-[#374151]">
                       <pre className="whitespace-pre-wrap font-mono text-xs overflow-auto max-h-40">{JSON.stringify(claim.extractedData, null, 2)}</pre>
                     </div>
                  )}
                </div>
              ) : (
                <div className="border border-dashed border-[#D1D5DB] rounded-xl p-8 text-center bg-[#F9FAFB]">
                  <FileSearch size={48} className="mx-auto text-[#9CA3AF] mb-4" />
                  <p className="font-bold text-[#111827] mb-1 text-lg">No OCR data available</p>
                  <p className="text-sm text-[#6B7280]">This claim was processed without OCR extraction</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline and other details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={cardStyle}>
               <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-purple-500" />
                <h3 className="text-[#111827] font-bold">Claim Timeline</h3>
              </div>
              <div className="space-y-4">
                {generateInvestigationTimeline().map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className={\`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 \${item.color}\`}>
                      {item.icon}
                    </div>
                    <div className="pb-4 border-b border-[#E5E7EB] flex-1">
                      <p className="font-bold text-[#111827] text-sm">{item.event}</p>
                      <p className="text-xs text-[#6B7280]">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={cardStyle}>
              <div className="flex items-center gap-2 mb-4">
                <Tag size={18} className="text-orange-500" />
                <h3 className="text-[#111827] font-bold">Additional Risk Indicators</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Amount Anomaly', 'Fast Submission', 'Missing Doctor Note'].map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-full text-xs font-bold">
                    {tag}
                  </span>
                ))}
                {['Valid Policy', 'Clean History'].map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Action Buttons */}
          {!isFinalized && !actionDone && (
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
              <button
                onClick={() => handleAction('BLOCKED', true)}
                disabled={!!actionLoading}
                className="flex items-center gap-2 bg-[#374151] hover:bg-[#111827] text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg disabled:opacity-50"
              >
                {actionLoading === 'BLOCKED' ? <Loader2 size={16} className="animate-spin" /> : <ShieldOff size={16} />}
                Mark Fraud
              </button>
              <button
                onClick={() => handleAction('REJECTED')}
                disabled={!!actionLoading}
                className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading === 'REJECTED' ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                Reject
              </button>
              <button
                onClick={() => handleAction('APPROVED')}
                disabled={!!actionLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg disabled:opacity-50"
              >
                {actionLoading === 'APPROVED' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Approve Claim
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
`;

const startIndex = content.indexOf('// Create portal for modal to render at root level');
const endIndex = content.indexOf('// Render modal via portal at document.body');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newModalContent + '\n  ' + content.substring(endIndex);
  fs.writeFileSync('src/components/admin/ClaimInvestigation.tsx', content, 'utf-8');
  console.log('Done!');
} else {
  console.log('Could not find start or end index');
}

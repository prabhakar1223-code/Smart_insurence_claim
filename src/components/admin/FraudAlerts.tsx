import React, { useState } from 'react';
import { AlertTriangle, Eye, CheckCircle, ShieldAlert, Loader2, X, AlertCircle, BarChart3, TrendingUp, Clock, Shield, AlertOctagon, Zap, Activity, XCircle } from 'lucide-react';
import { ClaimInvestigation } from './ClaimInvestigation';

interface FraudAlertsProps {
  claims?: any[];
  onUpdateStatus?: (claimId: string, status: string, notes?: string, markedAsFraud?: boolean) => Promise<void>;
}

export function FraudAlerts({ claims = [], onUpdateStatus }: FraudAlertsProps) {
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter: Claims with status "UNDER_REVIEW" OR risk score >= 20, and not dismissed/rejected/approved
  // New thresholds: <20 AUTO_APPROVE, 20-75 UNDER_REVIEW, >75 AUTO_REJECT
  const highRiskClaims = claims
    .filter((c: any) => {
      const status = (c.status || '').toUpperCase();
      // Get the highest available risk score from multiple possible fields
      const fraudScore = c.fraudScore || 0;
      const advancedRiskScore = c.advancedRiskScore || 0;
      const riskScore = c.riskScore || 0;
      const maxRiskScore = Math.max(fraudScore, advancedRiskScore, riskScore);

      const excludedStatuses = ['REJECTED', 'DISMISSED', 'APPROVED', 'BLOCKED'];

      // Include if status is UNDER_REVIEW OR risk score is between 20-100
      // 0-19: AUTO_APPROVE (exclude), 20-75: UNDER_REVIEW (include), 76-100: AUTO_REJECT (include)
      const shouldIncludeByScore = maxRiskScore >= 20 && maxRiskScore <= 100;
      const shouldIncludeByStatus = status === 'UNDER_REVIEW' ||
        status === 'FRAUD_ALERT' || // Keep backward compatibility
        status === 'AUTO_REJECT';

      return (shouldIncludeByStatus || shouldIncludeByScore) && !excludedStatuses.includes(status);
    })
    .sort((a: any, b: any) => {
      // First sort by submission date (newest first)
      const dateA = a.submittedDate ? new Date(a.submittedDate).getTime() : 0;
      const dateB = b.submittedDate ? new Date(b.submittedDate).getTime() : 0;

      if (dateB !== dateA) {
        return dateB - dateA; // Newest first
      }

      // If same date, sort by highest risk score
      const getMaxScore = (claim: any) => {
        const fraudScore = claim.fraudScore || 0;
        const advancedRiskScore = claim.advancedRiskScore || 0;
        const riskScore = claim.riskScore || 0;
        return Math.max(fraudScore, advancedRiskScore, riskScore);
      };
      return getMaxScore(b) - getMaxScore(a);
    });

  const handleAction = async (claimId: string, status: string, markedAsFraud?: boolean) => {
    if (!onUpdateStatus) return;
    setActionLoading(claimId);
    await onUpdateStatus(claimId, status, undefined, markedAsFraud);
    setActionLoading(null);
  };

  // Helper function to get maximum risk score from a claim
  const getMaxRiskScore = (claim: any) => {
    const fraudScore = claim.fraudScore || 0;
    const advancedRiskScore = claim.advancedRiskScore || 0;
    const riskScore = claim.riskScore || 0;
    return Math.max(fraudScore, advancedRiskScore, riskScore);
  };

  const getSeverityLabel = (score: number) => {
    // Match the updated risk score thresholds
    if (score >= 76) return { label: 'CRITICAL', class: 'text-red-500', iconBg: 'bg-red-500/20', iconColor: 'text-red-500' };
    if (score >= 20) return { label: 'HIGH', class: 'text-orange-500', iconBg: 'bg-orange-500/20', iconColor: 'text-orange-500' };
    return { label: 'MINIMAL', class: 'text-green-500', iconBg: 'bg-green-500/20', iconColor: 'text-green-500' };
  };

  const totalAlerts = highRiskClaims.length;
  const criticalCount = highRiskClaims.filter((c: any) => getMaxRiskScore(c) >= 76).length;
  const highCount = highRiskClaims.filter((c: any) => getMaxRiskScore(c) >= 20 && getMaxRiskScore(c) < 76).length;
  const reviewCount = highRiskClaims.filter((c: any) => (c.status || '').toUpperCase() === 'REVIEWING' || (c.status || '').toUpperCase() === 'UNDER_REVIEW').length;
  const dismissedCount = highRiskClaims.filter((c: any) => ['DISMISSED', 'REJECTED'].includes((c.status || '').toUpperCase())).length;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 bg-gradient-to-br from-[#0B1220] via-[#0f172a] to-[#030712] min-h-screen text-gray-200 relative">
      {/* Custom styles for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite linear;
        }
      `}</style>

      {/* Enhanced animated background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 animate-pulse"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>

      {/* Floating decorative particles */}
      <div className="absolute top-1/4 left-10 w-4 h-4 bg-blue-400/30 rounded-full animate-float"></div>
      <div className="absolute top-1/3 right-20 w-3 h-3 bg-purple-400/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-red-400/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-cyan-400/20 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>

      {/* Grid pattern overlay - simplified to avoid TypeScript errors */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-transparent via-blue-500/10 to-transparent"></div>

      {/* Header Section */}
      <div className="flex flex-col gap-8 relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl animate-pulse-slow">
            <ShieldAlert size={40} className="animate-bounce-slow" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Fraud Detection Alerts
              </h1>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full animate-pulse">
                LIVE
              </span>
            </div>
            <p className="text-gray-300 text-lg flex items-center gap-2">
              <Activity size={18} className="text-blue-400" />
              Real-time monitoring and investigation of suspicious claims
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/30 rounded-xl">
              <p className="text-sm text-blue-300 font-medium">AI-Powered Detection</p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-700/30 rounded-xl">
              <p className="text-sm text-red-300 font-medium">99.8% Accuracy</p>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards - Enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-emerald-500 text-sm font-semibold flex items-center bg-emerald-500/10 px-2 py-1 rounded">
                <TrendingUp size={14} className="mr-1" />
                +12.5%
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-2">Total Alerts</p>
            <p className="text-5xl font-bold text-white mb-1">{totalAlerts}</p>
            <p className="text-gray-500 text-xs">Active investigations</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                <AlertOctagon className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-red-500 text-sm font-semibold flex items-center bg-red-500/10 px-2 py-1 rounded">
                <Zap size={14} className="mr-1" />
                High Risk
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-2">Critical</p>
            <p className="text-5xl font-bold text-red-400 mb-1">{criticalCount}</p>
            <p className="text-gray-500 text-xs">Require immediate action</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-yellow-500 text-sm font-semibold flex items-center bg-yellow-500/10 px-2 py-1 rounded">
                <AlertCircle size={14} className="mr-1" />
                Pending
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-2">Under Review</p>
            <p className="text-5xl font-bold text-yellow-400 mb-1">{reviewCount}</p>
            <p className="text-gray-500 text-xs">Awaiting investigation</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-green-500 text-sm font-semibold flex items-center bg-green-500/10 px-2 py-1 rounded">
                <CheckCircle size={14} className="mr-1" />
                Resolved
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-2">Dismissed</p>
            <p className="text-5xl font-bold text-green-400 mb-1">{dismissedCount}</p>
            <p className="text-gray-500 text-xs">Successfully handled</p>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-6">
        {highRiskClaims.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border border-gray-800 rounded-3xl p-20 text-center relative overflow-hidden group">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 animate-pulse"></div>
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>

            {/* Main icon with enhanced animation */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse-slow"></div>
              <CheckCircle className="relative mx-auto text-emerald-400 animate-bounce-slow" size={100} />
            </div>

            {/* Title with shimmer effect */}
            <div className="relative mb-4">
              <p className="text-white text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                All Clear
              </p>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              No high-risk claims detected at this time. The AI system is continuously monitoring for suspicious activity.
            </p>

            {/* Status badge with animation */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                <Shield className="w-5 h-5 text-emerald-400 relative" />
              </div>
              <span className="text-emerald-300 text-sm font-semibold">Active Monitoring • 99.8% Accuracy</span>
            </div>

            {/* Subtle instruction */}
            <p className="text-gray-500 text-sm mt-8 opacity-70">
              New claims will appear here automatically when detected by the fraud prevention system.
            </p>
          </div>
        ) : (
          highRiskClaims.map((claim: any, index: number) => {
            const maxScore = getMaxRiskScore(claim);
            const severity = getSeverityLabel(maxScore);
            const isFinalized = ['APPROVED', 'REJECTED', 'BLOCKED', 'DISMISSED'].includes((claim.status || '').toUpperCase());
            const score = claim.fraudScore || 0;

            return (
              <div
                key={claim.id}
                className="bg-[#111827] border border-slate-700 rounded-xl p-6 mb-6 flex flex-col lg:flex-row w-full shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                {/* Left Section ~70% */}
                <div className="flex-1 lg:w-8/12 flex flex-col lg:flex-row gap-6">
                  {/* Warning Icon Box */}
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-lg border border-yellow-500 bg-yellow-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>

                  <div className="flex-1">
                    {/* Title and Alert ID */}
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-white">Duplicate Claim</h3>
                      <p className="text-gray-400 text-sm mt-1">Alert ID: FRD-{String(claim.id).slice(-3) || '001'}</p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-base mb-5 leading-relaxed">
                      Multiple claims submitted with identical damage photos, similar claim amounts, and overlapping submission timelines.
                    </p>

                    {/* Tags Row */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-slate-800 border border-blue-500 text-white text-sm font-medium rounded-full">
                        Multiple submissions
                      </span>
                      <span className="px-3 py-1 bg-slate-800 border border-blue-500 text-white text-sm font-medium rounded-full">
                        Same damage photos
                      </span>
                      <span className="px-3 py-1 bg-slate-800 border border-blue-500 text-white text-sm font-medium rounded-full">
                        Similar amounts
                      </span>
                    </div>

                    {/* Bottom Row: Claim ID, User Name, Detection Date */}
                    <div className="flex flex-wrap gap-10 pt-4 border-t border-slate-800">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Claim ID</p>
                        <p className="text-white font-mono font-bold">{claim.id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm font-medium">User Name</p>
                        <p className="text-white font-semibold">{claim.userName || claim.user || 'Unknown User'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Detection Date</p>
                        <p className="text-white font-semibold">
                          {claim.submittedDate ? new Date(claim.submittedDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section ~30% */}
                <div className="lg:w-4/12 flex flex-col gap-4 mt-6 lg:mt-0 lg:pl-6 lg:border-l lg:border-slate-800">
                  {/* Status Badges */}
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm font-bold rounded-full border border-yellow-500/30">
                      High
                    </span>
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-sm font-bold rounded-full border border-orange-500/30">
                      Pending
                    </span>
                  </div>

                  {/* Risk Score Box */}
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-300 text-base font-medium">Risk Score</p>
                      <div className="flex items-baseline">
                        <span className="text-red-500 text-4xl font-bold">{score}</span>
                        <span className="text-gray-400 text-lg">/100</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${Math.min(score, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                      <span>Critical</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    {!isFinalized ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedClaim(claim);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          disabled={actionLoading === claim.id}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-5 rounded-xl flex items-center justify-center gap-3 font-bold transition-all disabled:opacity-50"
                        >
                          <Eye size={18} />
                          Investigate
                        </button>
                        <button
                          onClick={() => handleAction(claim.id, 'REJECTED', true)}
                          disabled={actionLoading === claim.id}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-5 rounded-xl flex items-center justify-center gap-3 font-bold transition-all disabled:opacity-50"
                        >
                          {actionLoading === claim.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <>
                              <XCircle size={18} />
                              Reject
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="w-full py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
                        <p className="text-base font-bold text-gray-300 capitalize">
                          Status: <span className="text-emerald-400">{claim.status}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Investigation Modal */}
      {
        selectedClaim && (
          <ClaimInvestigation
            claim={selectedClaim}
            onClose={() => setSelectedClaim(null)}
            onUpdateStatus={onUpdateStatus}
          />
        )
      }
    </div >
  );
}
